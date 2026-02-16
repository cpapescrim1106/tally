import { getToken } from 'next-auth/jwt';
import { MAX_TASKS, INITIAL_BATCH_SIZE } from '../../utils/constants';
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithRetry } from '../../utils/fetchWithRetry';
import path from 'path';
import { promises as fs } from 'fs';
import type {
  CompletedTask,
  TodoistStats,
  TodoistUser,
  LoadMoreResponse,
  ErrorResponse,
  DashboardData,
  ActiveTask,
  ProjectData,
  SectionData,
  Label,
} from '../../types';

const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA === 'true';

interface ApiResponse extends Omit<DashboardData, 'projectData' | 'sections'> {
  projectData: ProjectData[];
  sections: SectionData[];
}

interface CursorPage<T> {
  results: T[];
  next_cursor?: string | null;
}

class TodoistAPIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'TodoistAPIError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

async function loadDummyDataset(): Promise<ApiResponse> {
  const datasetPath = path.join(process.cwd(), 'test/data/dummy-dataset.json');

  try {
    const fileContents = await fs.readFile(datasetPath, 'utf-8');
    return JSON.parse(fileContents) as ApiResponse;
  } catch (error) {
    console.error('Failed to load dummy dataset at', datasetPath, error);
    throw new Error('Fake dataset not found. Create test/data/dummy-dataset.json or disable USE_DUMMY_DATA.');
  }
}

const mapToActiveTask = (task: any): ActiveTask => ({
  assigneeId: task.responsible_uid ?? task.assignee_id ?? null,
  assignerId: task.assigned_by_uid ?? null,
  commentCount: task.comment_count ?? 0,
  content: task.content ?? '',
  createdAt: task.added_at ?? task.created_at ?? new Date().toISOString(),
  creatorId: String(task.added_by_uid ?? task.creator_uid ?? ''),
  description: task.description ?? '',
  due: task.due
    ? {
        isRecurring: !!task.due.is_recurring,
        string: task.due.string ?? '',
        date: task.due.date,
        datetime: task.due.datetime ?? null,
        timezone: task.due.timezone ?? null,
      }
    : null,
  id: String(task.id),
  isCompleted: !!task.checked,
  labels: Array.isArray(task.labels) ? task.labels : [],
  order: task.child_order ?? task.order ?? 0,
  parentId: task.parent_id ? String(task.parent_id) : null,
  priority: task.priority ?? 1,
  projectId: String(task.project_id),
  sectionId: task.section_id ? String(task.section_id) : null,
  url: task.url ?? ('https://app.todoist.com/app/task/' + task.id),
  deadline: task.deadline?.date ?? null,
});

const mapToProjectData = (project: any): ProjectData => ({
  ...project,
  id: String(project.id),
  parentId: project.parent_id ? String(project.parent_id) : null,
  name: project.name,
  color: project.color,
});

const mapToLabel = (label: any): Label => ({
  id: String(label.id),
  name: label.name,
  color: label.color,
  order: label.order ?? 0,
  isFavorite: !!label.is_favorite,
});

async function todoistGet(token: string, endpoint: string, query?: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value !== 'undefined') qs.append(key, String(value));
    }
  }

  const url = 'https://api.todoist.com/api/v1/' + endpoint + (qs.toString() ? '?' + qs.toString() : '');
  const response = await fetchWithRetry(url, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
    maxRetries: 3,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error details available');
    throw new TodoistAPIError(response.status, 'Todoist API error on ' + endpoint + ': ' + response.status + ' ' + response.statusText + '. ' + errorText);
  }

  return response.json();
}

async function fetchAllWithCursor<T = any>(token: string, endpoint: string, limit = 200): Promise<T[]> {
  const results: T[] = [];
  let cursor: string | null = null;

  while (true) {
    const data = (await todoistGet(token, endpoint, {
      limit,
      cursor: cursor || undefined,
    })) as CursorPage<T>;

    const chunk = Array.isArray(data.results) ? data.results : [];
    results.push(...chunk);

    if (!data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return results;
}

async function getTotalTaskCount(token: string): Promise<number> {
  const data = (await todoistGet(token, 'tasks/completed/stats')) as TodoistStats;
  if (typeof data.completed_count !== 'number') {
    throw new Error('Invalid response: completed_count is not a number');
  }
  return data.completed_count;
}

async function fetchCompletedTasksBatch(token: string, offset: number, limit: number): Promise<CompletedTask[]> {
  if (!Number.isInteger(offset) || offset < 0) {
    throw new ValidationError('Invalid offset: must be a non-negative integer');
  }
  if (limit <= 0) {
    throw new ValidationError('Invalid limit: must be a positive integer');
  }

  const data = (await todoistGet(token, 'tasks/completed', { offset, limit })) as { items?: CompletedTask[] };
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid response: items is not an array');
  }

  return data.items;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ApiResponse | LoadMoreResponse | ErrorResponse>
) {
  try {
    if (USE_DUMMY_DATA) {
      const dummyDataset = await loadDummyDataset();

      if (request.query.loadMore === 'true') {
        return response.status(200).json({
          newTasks: [],
          hasMoreTasks: false,
          totalTasks: dummyDataset.totalCompletedTasks,
          loadedTasks: dummyDataset.totalCompletedTasks,
        });
      }

      return response.status(200).json(dummyDataset as unknown as ApiResponse);
    }

    const token = await getToken({ req: request });
    if (!token?.accessToken) {
      return response.status(401).json({ error: 'Not authenticated' });
    }

    const accessToken = token.accessToken as string;

    if (request.query.loadMore === 'true') {
      const offset = parseInt(request.query.offset as string) || 0;
      const total = parseInt(request.query.total as string) || 0;

      try {
        const newTasks = await fetchCompletedTasksBatch(accessToken, offset, INITIAL_BATCH_SIZE);
        return response.status(200).json({
          newTasks,
          hasMoreTasks: offset + newTasks.length < total && offset + newTasks.length < MAX_TASKS,
          totalTasks: total,
          loadedTasks: offset + newTasks.length,
        });
      } catch (error) {
        console.error('Error loading more tasks:', error);
        return response.status(500).json({ error: 'Failed to load more tasks' });
      }
    }

    const [userData, totalCount, projects, tasks, labels, sections] = await Promise.all([
      todoistGet(accessToken, 'user') as Promise<TodoistUser>,
      getTotalTaskCount(accessToken),
      fetchAllWithCursor<any>(accessToken, 'projects'),
      fetchAllWithCursor<any>(accessToken, 'tasks'),
      fetchAllWithCursor<any>(accessToken, 'labels'),
      fetchAllWithCursor<any>(accessToken, 'sections'),
    ]);

    const initialTasks = await fetchCompletedTasksBatch(accessToken, 0, INITIAL_BATCH_SIZE);

    const projectData = projects.map(mapToProjectData);
    const activeTasks = tasks.map(mapToActiveTask);
    const mappedLabels = labels.map(mapToLabel);

    const sectionData: SectionData[] = sections.map((section: any) => ({
      id: String(section.id),
      projectId: String(section.project_id),
      name: section.name,
      order: section.section_order ?? section.order ?? 0,
    }));

    const responseData: ApiResponse = {
      allCompletedTasks: initialTasks,
      projectData,
      sections: sectionData,
      activeTasks,
      labels: mappedLabels,
      totalCompletedTasks: totalCount,
      hasMoreTasks: initialTasks.length < Math.min(totalCount, MAX_TASKS),
      karma: userData.karma,
      karmaRising: userData.karma_trend === 'up',
      karmaTrend: userData.karma_trend as 'up' | 'down' | 'none',
      dailyGoal: userData.daily_goal,
      weeklyGoal: userData.weekly_goal,
    };

    response.status(200).json(responseData);
  } catch (error) {
    console.error('Error in getTasks API:', error);
    if (error instanceof TodoistAPIError) {
      return response.status(error.statusCode).json({
        error: error.message,
        details: 'Todoist API error',
      });
    }
    if (error instanceof ValidationError) {
      return response.status(400).json({
        error: error.message,
        details: 'Validation error',
      });
    }
    response.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
