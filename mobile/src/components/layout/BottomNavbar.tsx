import { Home, Search, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNavbar = () => {
  const navItems = [
    { 
      icon: Home, 
      label: "Experiências", 
      path: "/" 
    },
    { 
      icon: Search, 
      label: "Pesquisar", 
      path: "/search" 
    },
    { 
      icon: User, 
      label: "Perfil", 
      path: "/profile" 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                "text-muted-foreground hover:text-primary",
                isActive && "text-primary bg-primary/10"
              )
            }
          >
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;