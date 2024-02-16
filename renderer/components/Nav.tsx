import React from 'react';
import { NavLink } from 'react-router-dom';

export function Nav() {
  return (
    <nav className="space-x-4">
      <NavLink to="/" className={({ isActive }) => isActive ? 'bg-blue-600 text-white px-3 py-1 inline-block font-semibold rounded border-2 border-blue-600' : 'text-blue-600 px-3 py-1 inline-block font-semibold rounded border-2 border-blue-600'}>Home</NavLink>
    </nav>
  )
}