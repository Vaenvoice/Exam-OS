import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  History, 
  Users, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/exams', icon: <BookOpen size={20} />, label: 'Exams' },
    { to: '/admin/exams/new', icon: <PlusCircle size={20} />, label: 'Create Exam' },
    { to: '/admin/results', icon: <History size={20} />, label: 'Results' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Manage Users' }
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/student/exams', icon: <BookOpen size={20} />, label: 'Available Exams' },
    { to: '/student/results', icon: <History size={20} />, label: 'My Results' }
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/teacher/exams', icon: <BookOpen size={20} />, label: 'Exams' },
    { to: '/teacher/exams/new', icon: <PlusCircle size={20} />, label: 'Create Exam' },
    { to: '/teacher/results', icon: <History size={20} />, label: 'Results' }
  ];

  let links = studentLinks;
  if (user.role === 'admin') links = adminLinks;
  if (user.role === 'teacher') links = teacherLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-links">
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
