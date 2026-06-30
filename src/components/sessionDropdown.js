"use client";

import Link from "next/link";

export default function SessionDropdown({session}) {
    return (
        <>
            <p className="mr-4 capitalize">{session?.user?.email.replace("@epfl.ch", "").replace(".", " ")}</p>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src={session?.user?.image} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li>
                  <a className="justify-between">
                    Profile (not working)
                    <span className="badge">New</span>
                  </a>
                </li>
                <li><a>Settings (not working)</a></li>
                <li>
                <a>
                    Logout (not working)
                </a>
                </li>
              </ul>
            </div>
        </>
    )
};