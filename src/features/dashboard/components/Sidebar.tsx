import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import type { NavKey } from "../navigation";
import "./Sidebar.css";

type NavItem = {
  key: NavKey;
  label: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Inicio", icon: "House" },
  { key: "pets", label: "Mis mascotas", icon: "Dog" },
  { key: "walks", label: "Paseos", icon: "PawPrint" },
  { key: "veterinary", label: "Veterinaria", icon: "Stethoscope" },
  { key: "grooming", label: "Peluquería", icon: "Bath" },
  { key: "promotions", label: "Promociones", icon: "Star" },
  { key: "orders", label: "Mis pedidos", icon: "CalendarCheck" },
  { key: "shop", label: "Tienda", icon: "ShoppingBag" },
  { key: "wallet", label: "Pagos", icon: "Wallet" },
];

type SidebarProps = {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onLogout: () => void;
  onHelp: () => void;
  onClub: () => void;
};

export function Sidebar({ active, onNavigate, onLogout, onHelp, onClub }: SidebarProps) {
  return (
    <aside className="vih-sidebar">
      <div className="vih-sidebar-brand">
        <span className="vih-sidebar-mark">
          <Icon name="PawPrint" size={23} color="#fff" stroke={2.4} />
        </span>
        <span className="vih-sidebar-name">Vet·In·House</span>
      </div>

      <nav className="vih-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              className={`vih-nav-item vih-press ${isActive ? "is-active" : ""}`}
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon name={item.icon} size={20} stroke={isActive ? 2.4 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="vih-sidebar-bottom">
        <div className="vih-club-card">
          <Icon name="Crown" size={22} color="var(--gold-600)" />
          <p className="vih-club-title">Club premium</p>
          <p className="vih-club-desc">Paseos ilimitados y -20% en salud.</p>
          <button className="vih-club-cta vih-press" type="button" onClick={onClub}>
            Únete
          </button>
        </div>
        <button className="vih-sidebar-help vih-press" type="button" onClick={onHelp}>
          <Icon name="LifeBuoy" size={19} /> Ayuda
        </button>
        <button className="vih-sidebar-logout vih-press" type="button" onClick={onLogout}>
          <Icon name="LogOut" size={19} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
