import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/test", label: "Teste" },
  { to: "/programs", label: "Programas" },
  { to: "/dashboard", label: "Painel" },
  { to: "/gamification", label: "Gamificação" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "Sobre" },
  { to: "/contact", label: "Contato" },
];

const authNavItems = [
  { to: "/", label: "Início" },
  { to: "/test", label: "Teste" },
  { to: "/programs", label: "Programas" },
  { to: "/dashboard", label: "Painel" },
  { to: "/profile", label: "Perfil" },
  { to: "/gamification", label: "Gamificação" },
  { to: "/faq", label: "FAQ" },
];

const Navbar = () => {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setHasSession(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setHasSession(!!session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full border-b bg-card/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3" aria-label="Ir para início">
            <img
              src="/lovable-uploads/6d26456f-f9b2-44cd-b3ba-16cc677e4993.png"
              alt="Logotipo Além das Notificações"
              className="h-9 w-9"
              loading="lazy"
            />
            <span className="text-lg font-bold">Além das Notificações</span>
          </Link>
        </div>

        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-6">
          {(hasSession ? authNavItems : navItems).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-smooth hover:text-primary ${
                  isActive ? "text-primary font-medium" : "text-foreground/80"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="elevated" size="sm">
            <Link to="/test" aria-label="Começar teste">Fazer Teste</Link>
          </Button>
          {hasSession ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={async () => { 
                try {
                  await supabase.auth.signOut(); 
                } catch (error) {
                  console.error('Logout error:', error);
                  // Force logout by clearing local storage
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }
              }}
            >
              Sair
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
