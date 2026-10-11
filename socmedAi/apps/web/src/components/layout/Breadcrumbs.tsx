import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
export function Breadcrumbs() { const location = useLocation(); const parts = location.pathname.split('/').filter(Boolean); return <div className="breadcrumbs"><Link to="/dashboard" aria-label="Dashboard"><Home size={12} /></Link>{parts.map((part) => <span key={part}><ChevronRight size={12} /><span>{part === 'new' ? 'Create' : part.replace('-', ' ')}</span></span>)}</div>; }
