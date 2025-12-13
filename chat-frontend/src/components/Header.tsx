import { Link } from "@tanstack/react-router";

import { LogOut } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { logoutFn } from "@/service/logout";

export default function Header() {
  const logout = useServerFn(logoutFn);

  return (
    <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
      <h1 className="text-xl font-semibold">
        <Link to="/">
          <img
            src="/tanstack-word-logo-white.svg"
            alt="TanStack Logo"
            className="h-10"
          />
        </Link>
      </h1>
      <button
        onClick={() => logout()}
        className="ml-auto p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
        aria-label="Logout"
      >
        <LogOut size={20} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
