import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/test", label: "Teste" },
  { to: "/programs", label: "Programas" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "Sobre" },
  { to: "/contact", label: "Contato" },
];

const Navbar = () => {
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
          {navItems.map((item) => (
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
