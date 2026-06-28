import { Icon } from "./Icon";
import { PersonAvatar } from "./PersonAvatar";
import type { Provider } from "../data/providers";

type ProviderCardProps = {
  provider: Provider;
  selected: boolean;
  onSelect: () => void;
};

export function ProviderCard({ provider, selected, onSelect }: ProviderCardProps) {
  return (
    <button
      type="button"
      className={`vih-provider-card vih-press ${selected ? "is-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="vih-provider-card-head">
        <PersonAvatar
          size={52}
          hue={provider.hue}
          label={provider.name}
          photoUrl={provider.photoUrl}
        />
        <div className="vih-provider-card-meta">
          <p className="vih-provider-card-name">
            {provider.name}
            {provider.badge && (
              <span className="vih-provider-badge">{provider.badge}</span>
            )}
          </p>
          <p className="vih-provider-card-rating">
            <Icon name="Star" size={13} color="var(--gold-600)" />
            {provider.rating.toFixed(2)} <span>({provider.reviews})</span>
            <span className="vih-provider-card-sep">·</span>
            <Icon name="MapPin" size={13} color="var(--ink-mute)" />
            {provider.distanceKm.toFixed(1)} km
            <span className="vih-provider-card-sep">·</span>
            {provider.etaMin} min
          </p>
        </div>
        {selected && (
          <span className="vih-provider-card-check" aria-hidden="true">
            <Icon name="Check" size={14} />
          </span>
        )}
      </div>
      <p className="vih-provider-card-bio">{provider.bio}</p>
      <div className="vih-provider-card-tags">
        {provider.specialties.slice(0, 3).map((tag) => (
          <span key={tag} className="vih-provider-card-tag">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
