import React from "react";
import Link from "next/link";
import { MdFeedback } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";
import VersionInfo from "../shared/VersionInfo";

const Footer: React.FC = () => {
  return (
    <footer className="py-4">
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm text-warm-gray pb-0">
          &copy; {new Date().getFullYear()} Tally - Built by Chris ·{' '}
          <a
            href="https://github.com/uncazzy/todoist-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Based on uncazzy/todoist-dashboard (MIT)
          </a>{' '}
          · <Link href="/legal" className="hover:text-white">Legal & About</Link>
          {' · '}<VersionInfo />
        </p>
        <div className="flex items-center gap-4 mt-2">
          <a
            href="https://github.com/cpapescrim1106/tally/issues"
            target="_blank"
            rel="noopener noreferrer"
            title="Share feedback or report a bug"
            className="text-warm-gray hover:text-white"
          >
            <MdFeedback className="text-xl" />
          </a>
          <a
            href="https://github.com/cpapescrim1106/tally"
            target="_blank"
            rel="noopener noreferrer"
            title="View the Tally repository"
            className="text-warm-gray hover:text-white"
          >
            <FaGithub className="text-lg" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
