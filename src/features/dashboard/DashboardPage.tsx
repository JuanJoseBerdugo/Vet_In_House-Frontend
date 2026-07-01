import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ToastProvider, useToast } from "./components/ToastProvider";
import { ServiceWizard } from "./components/ServiceWizard";
import { LiveWalkPanel } from "./components/LiveWalkPanel";
import { PaymentSuccessModal } from "./components/PaymentSuccessModal";
import { PremiumModal } from "./components/PremiumModal";
import { PetProvider } from "./state/PetContext";
import {
  SimulatedWalkProvider,
  useSimulatedWalk,
} from "./state/SimulatedWalkContext";
import { InicioView } from "./views/InicioView";
import { MisMascotasView } from "./views/MisMascotasView";
import { MisPedidosView } from "./views/MisPedidosView";
import { TiendaView } from "./views/TiendaView";
import { PagosView } from "./views/PagosView";
import { ServiceFeatureView } from "./views/ServiceFeatureView";
import { PromocionesView } from "./views/PromocionesView";
import { getPerfil } from "../auth/api/perfilApi";
import { ApiError } from "../../lib/api/apiClient";
import type { NavKey } from "./navigation";
import type { ServiceEntry } from "./data/catalog";
import type { Provider } from "./data/providers";
import type { AuthSession } from "../../types/auth";
import type { Mascota, Perfil } from "../../types/domain";
import "./DashboardPage.css";
import "./DashboardMain.css";
import "./DashboardPrimitives.css";
import "./components/ServiceDemo.css";
import "./views/DashboardViewLayout.css";

type DashboardPageProps = {
  session: AuthSession;
  onLogout: () => void;
};

export function DashboardPage({ session, onLogout }: DashboardPageProps) {
  return (
    <ToastProvider>
      <PetProvider token={session.accessToken}>
        <SimulatedWalkProvider>
          <DashboardShell session={session} onLogout={onLogout} />
        </SimulatedWalkProvider>
      </PetProvider>
    </ToastProvider>
  );
}

type PaymentSuccessState = {
  totalCop: number;
  method: string;
  service: ServiceEntry;
  provider: Provider;
  mascota: Mascota;
  liveAvailable: boolean;
};

function DashboardShell({ session, onLogout }: DashboardPageProps) {
  const showToast = useToast();
  const { walk } = useSimulatedWalk();
  const [nav, setNav] = useState<NavKey>("home");
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [wizard, setWizard] = useState<ServiceEntry | null>(null);
  const [success, setSuccess] = useState<PaymentSuccessState | null>(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  useEffect(() => {
    getPerfil(session.accessToken)
      .then((data) => setPerfil(data))
      .catch((caught) => {
        if (caught instanceof ApiError && caught.status !== 401) {
          showToast(caught.message, "error");
        }
      });
  }, [session.accessToken, showToast]);

  function handleNavigate(key: NavKey) {
    setNav(key);
  }

  function renderView() {
    switch (nav) {
      case "home":
        return (
          <InicioView
            token={session.accessToken}
            onNavigate={handleNavigate}
            onServiceRequest={setWizard}
            onOpenLive={() => setLiveOpen(true)}
          />
        );
      case "pets":
        return <MisMascotasView token={session.accessToken} />;
      case "walks":
        return (
          <ServiceFeatureView
            serviceKey="paseo"
            onServiceRequest={setWizard}
            onOpenLive={() => setLiveOpen(true)}
          />
        );
      case "veterinary":
        return (
          <ServiceFeatureView
            serviceKey="vet"
            onServiceRequest={setWizard}
          />
        );
      case "grooming":
        return (
          <ServiceFeatureView
            serviceKey="pelu"
            onServiceRequest={setWizard}
          />
        );
      case "promotions":
        return (
          <PromocionesView
            onNavigate={handleNavigate}
            onOpenClub={() => setPremiumOpen(true)}
          />
        );
      case "orders":
        return <MisPedidosView token={session.accessToken} />;
      case "shop":
        return <TiendaView token={session.accessToken} />;
      case "wallet":
        return <PagosView token={session.accessToken} />;
      default:
        return null;
    }
  }

  const displayName = perfil?.nombre ?? session.email.split("@")[0] ?? "Sofia";

  return (
    <div className="vih vih-dashboard">
      <Sidebar
        active={nav}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        onHelp={() => showToast("Pronto: chat de ayuda")}
        onClub={() => setPremiumOpen(true)}
      />

      <div className="vih-main vih-scroll">
        <Topbar
          userName={displayName}
          onSearch={(query) => {
            if (query.trim()) showToast(`Buscando: ${query}`);
          }}
          onBell={() => showToast("No tienes notificaciones nuevas")}
          onOpenLive={walk ? () => setLiveOpen(true) : undefined}
        />

        <div className="vih-main-content" key={nav}>
          {renderView()}
        </div>
      </div>

      {wizard && (
        <ServiceWizard
          service={wizard}
          token={session.accessToken}
          onClose={() => setWizard(null)}
          onCompleted={({ totalCop, method, provider, mascota }) => {
            const liveAvailable = wizard.key === "paseo";
            setWizard(null);
            setSuccess({
              totalCop,
              method,
              service: wizard,
              provider,
              mascota,
              liveAvailable,
            });
          }}
        />
      )}

      {success && (
        <PaymentSuccessModal
          title={`${success.service.label} confirmado`}
          description={`${success.provider.name} sera notificado para atender a ${success.mascota.nombre}.`}
          amount={success.totalCop}
          method={methodLabel(success.method)}
          primaryLabel={success.liveAvailable ? "Ver paseo en vivo" : "Ir a mis pedidos"}
          onPrimary={() => {
            if (success.liveAvailable) {
              setLiveOpen(true);
            } else {
              setNav("orders");
            }
            setSuccess(null);
          }}
          secondaryLabel="Cerrar"
          onSecondary={() => setSuccess(null)}
        />
      )}

      {premiumOpen && <PremiumModal onClose={() => setPremiumOpen(false)} />}

      {liveOpen && walk && (
        <LiveWalkPanel
          onClose={() => setLiveOpen(false)}
          onCompleted={() => {
            showToast("Servicio finalizado", "success");
          }}
        />
      )}
    </div>
  );
}

function methodLabel(method: string) {
  switch (method) {
    case "tarjeta":
      return "Tarjeta";
    case "pse":
      return "PSE";
    case "nequi":
      return "Nequi";
    case "daviplata":
      return "Daviplata";
    default:
      return method;
  }
}
