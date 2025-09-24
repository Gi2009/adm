import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MapPin, 
  Star, 
  Users, 
  FileText, 
  MessageCircle,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Aprovações de Viagens", href: "travel-approvals", icon: MapPin },
  { name: "Aprovações de Experiências", href: "experience-approvals", icon: Star },
  { name: "Registro de Usuários", href: "user-records", icon: Users },
  { name: "Aprovar donos de experiencia", href: "/Hause/CandidatesDashboard", icon: Users },
  { name: "Registro de Experiências", href: "experience-records", icon: FileText },
  { name: "Solicitações de reembolso", href: "Reembolso", icon: FileText },
  /*{ name: "Chat de Ajuda", href: "/help-chat", icon: MessageCircle },*/
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center space-x-2">
          <Menu className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">
            Turismo Admin
          </span>
        </div>
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;