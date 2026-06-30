"use server";

import { auth } from "@/services/auth";
import { signOut } from "next-auth/react";
import SessionDropdown from "@/components/sessionDropdown";

export default async function AdminLayout({ children }) {
  const session = await auth();
  return (
    <div className="admin-layout">
      <div>
        <div className="navbar bg-base-100 shadow-sm text-white bg-blue-500">
          <div className="navbar-start">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li><a href="/">Dashboard view</a></li>
                <li><a href="/admin">BackOffice</a></li>
                <li><a>About (not working)</a></li>
              </ul>
            </div>
          </div>
          <div className="navbar-center">
            <a href="/admin" className="btn btn-ghost text-xl">BoardFSDash</a>
          </div>
          <div className="navbar-end">
          <SessionDropdown session={session} />
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}