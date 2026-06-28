import { useEffect, useMemo, useState } from "react";
import { DialogPortal } from "../components/DialogPortal";
import { Icon } from "../components/Icon";
import { useToast } from "../components/ToastProvider";
import { listProductos } from "../../shop/api/productosApi";
import { crearPedido } from "../../shop/api/pedidosApi";
import { procesarPago } from "../../payments/api/pagosApi";
import { getPetShopImages, type PetShopImage } from "../../media/api/pixabayApi";
import { listPromociones } from "../../marketing/api/marketingApi";
import { ApiError } from "../../../lib/api/apiClient";
import type { MetodoPago, Producto, PromocionPetshop } from "../../../types/domain";

type TiendaViewProps = {
  token: string;
};

type CartItem = {
  producto: Producto;
  cantidad: number;
};

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: "tarjeta", label: "Tarjeta" },
  { value: "pse", label: "PSE" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
];

export function TiendaView({ token }: TiendaViewProps) {
  const showToast = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("tarjeta");
  const [checkout, setCheckout] = useState(false);
  const [shopImages, setShopImages] = useState<PetShopImage[]>([]);
  const [promociones, setPromociones] = useState<PromocionPetshop[]>([]);

  useEffect(() => {
    listProductos()
      .then((data) => setProductos(data))
      .catch((caught) => {
        if (caught instanceof ApiError) showToast(caught.message, "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    getPetShopImages()
      .then((images) => setShopImages(images))
      .catch(() => setShopImages([]));
  }, []);

  useEffect(() => {
    listPromociones()
      .then((data) => setPromociones(data))
      .catch(() => setPromociones([]));
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(productos.map((p) => p.categoria));
    return Array.from(set);
  }, [productos]);

  const subtotal = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const total = subtotal;
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const heroPromotion = promociones[0];
  const heroImage = heroPromotion?.imagenUrl ?? shopImages[0]?.imageUrl ?? "";
  const promoCards = promociones.length > 1 ? promociones.slice(1, 4) : [];
  const promoImages = promoCards.length === 0 ? shopImages.slice(1, 4) : [];

  function addToCart(producto: Producto) {
    setCart((prev) => {
      const found = prev.find((item) => item.producto.id === producto.id);
      if (found) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
            : item,
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
    showToast(`${producto.nombre} agregado`, "success");
  }

  function changeQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.producto.id === id
            ? { ...item, cantidad: item.cantidad + delta }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.producto.id !== id));
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      showToast("Tu carrito está vacío", "error");
      return;
    }
    if (!direccion.trim()) {
      showToast("Agrega una dirección de envío", "error");
      return;
    }

    setCheckout(true);
    try {
      const pedido = await crearPedido(
        {
          DireccionEnvio: direccion.trim(),
          Items: cart.map((item) => ({
            ProductoId: item.producto.id,
            Cantidad: item.cantidad,
          })),
        },
        token,
      );

      const pago = await procesarPago(
        { Metodo: metodo, PedidoId: pedido.id },
        token,
      );

      showToast(`Pago ${pago.estado} con ${metodo}`, "success");
      setCart([]);
      setCartOpen(false);
      setDireccion("");
    } catch (caught) {
      const message =
        caught instanceof ApiError ? caught.message : "No pude completar la compra";
      showToast(message, "error");
    } finally {
      setCheckout(false);
    }
  }

  return (
    <section className="vih-view">
      <header className="vih-view-header">
        <div>
          <h1>Tienda</h1>
          <p>Productos seleccionados para tu mascota.</p>
        </div>
        <button
          type="button"
          className="vih-primary"
          onClick={() => setCartOpen(true)}
          disabled={cart.length === 0}
        >
          <Icon name="ShoppingCart" size={18} /> Carrito ({cartCount})
        </button>
      </header>

      {loading && <p className="vih-loading">Cargando catálogo...</p>}

      <section className="vih-shop-hero">
        <div className="vih-shop-hero-copy">
          <span className="vih-demo-banner-tag">PETSHOP EN CASA</span>
          <h2>{heroPromotion?.titulo ?? "Productos listos para consentir a tu mascota"}</h2>
          <p>
            {heroPromotion?.descripcion ??
              "Alimentos, juguetes y cuidado diario con entrega coordinada desde la plataforma."}
          </p>
          <button
            type="button"
            className="vih-primary"
            onClick={() => setCartOpen(true)}
            disabled={cart.length === 0}
          >
            <Icon name="ShoppingCart" size={18} /> Ver carrito
          </button>
        </div>
        <div
          className="vih-shop-hero-media"
          style={{
            backgroundImage: heroImage ? `url(${heroImage})` : undefined,
          }}
        >
          <span>{heroPromotion?.descuentoPorcentaje ? `${heroPromotion.descuentoPorcentaje}% OFF` : "Petshop"}</span>
        </div>
      </section>

      {promoCards.length > 0 && (
        <div className="vih-shop-promos">
          {promoCards.map((promo) => (
            <article
              key={promo.id}
              className="vih-shop-promo"
              style={{ backgroundImage: promo.imagenUrl ? `url(${promo.imagenUrl})` : undefined }}
            >
              <div>
                <span>{promo.descuentoPorcentaje ? `${promo.descuentoPorcentaje}% OFF` : promo.tipo}</span>
                <strong>{promo.titulo}</strong>
              </div>
            </article>
          ))}
        </div>
      )}

      {promoCards.length === 0 && promoImages.length > 0 && (
        <div className="vih-shop-promos">
          {promoImages.map((image, idx) => (
            <article
              key={image.id}
              className="vih-shop-promo"
              style={{ backgroundImage: `url(${image.imageUrl})` }}
            >
              <div>
                <span>{idx === 0 ? "Snacks" : idx === 1 ? "Juguetes" : "Cuidado"}</span>
                <strong>{idx === 0 ? "Premios saludables" : idx === 1 ? "Juego y energía" : "Rutina feliz"}</strong>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && productos.length === 0 && (
        <div className="vih-empty">
          <Icon name="ShoppingBag" size={42} color="var(--green-cta)" />
          <h2>Catálogo vacío</h2>
          <p>Aún no hay productos disponibles.</p>
        </div>
      )}

      {categorias.map((categoria) => (
        <div key={categoria} className="vih-shop-category">
          <h2 className="vih-section-title compact">{categoria}</h2>
          <div className="vih-products-grid">
            {productos
              .filter((p) => p.categoria === categoria)
              .map((producto, idx) => {
                const image = productImage(producto, idx, shopImages);
                return (
                <article
                  key={producto.id}
                  className="vih-product-card"
                  style={{ animationDelay: `${0.05 + idx * 0.03}s` }}
                >
                  <div
                    className="vih-product-hero"
                    style={{
                      background: image
                        ? `url(${image}) center/cover no-repeat`
                        : "var(--surface-2)",
                    }}
                  >
                    {!image && <Icon name="ShoppingBag" size={32} color="var(--ink-mute)" />}
                  </div>
                  <div className="vih-product-body">
                    <p className="vih-product-name">{producto.nombre}</p>
                    {producto.descripcion && (
                      <p className="vih-product-desc">{producto.descripcion}</p>
                    )}
                    <div className="vih-product-footer">
                      <strong>{formatMoney(producto.precio)}</strong>
                      <button
                        type="button"
                        className="vih-icon-btn vih-icon-btn-primary vih-press"
                        onClick={() => addToCart(producto)}
                        disabled={producto.stock <= 0}
                        aria-label={`Agregar ${producto.nombre}`}
                      >
                        <Icon name="Plus" size={18} />
                      </button>
                    </div>
                    {producto.stock <= 0 && (
                      <p className="vih-product-out">Sin stock</p>
                    )}
                  </div>
                </article>
              );
              })}
          </div>
        </div>
      ))}

      {cartCount > 0 && !cartOpen && (
        <button
          type="button"
          className="vih-floating-cart vih-press"
          onClick={() => setCartOpen(true)}
          aria-label={`Abrir carrito con ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`}
        >
          <span className="vih-floating-cart-icon" aria-hidden="true">
            <Icon name="ShoppingCart" size={22} />
          </span>
          <span className="vih-floating-cart-copy">
            <strong>Carrito</strong>
            <small>
              {cartCount} item{cartCount === 1 ? "" : "s"} · {formatMoney(subtotal)}
            </small>
          </span>
          <span className="vih-floating-cart-count" aria-hidden="true">
            {cartCount}
          </span>
        </button>
      )}

      {cartOpen && (
        <DialogPortal>
        <div className="vih-cart-overlay">
          <button
            type="button"
            className="vih-cart-backdrop"
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar carrito"
          />
          <aside className="vih-cart-drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras">
            <header className="vih-cart-header">
              <div>
                <span className="vih-cart-eyebrow">Checkout petshop</span>
                <h2>Tu carrito</h2>
                <p>
                  {cartCount === 1
                    ? "1 producto listo para pedir"
                    : `${cartCount} productos listos para pedir`}
                </p>
              </div>
              <button
                type="button"
                className="vih-icon-btn vih-press"
                onClick={() => setCartOpen(false)}
                aria-label="Cerrar carrito"
              >
                <Icon name="X" size={18} />
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="vih-cart-empty">
                <span>
                  <Icon name="ShoppingCart" size={30} />
                </span>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos de la tienda para crear un pedido y pagarlo desde la plataforma.</p>
                <button
                  type="button"
                  className="vih-primary"
                  onClick={() => setCartOpen(false)}
                >
                  Seguir comprando
                </button>
              </div>
            ) : (
              <>
                <div className="vih-cart-body">
                  <section className="vih-cart-status">
                    <span>
                      <Icon name="ShieldCheck" size={20} />
                    </span>
                    <div>
                      <strong>Compra protegida</strong>
                      <p>El pedido queda conectado a tus pagos e historial de órdenes.</p>
                    </div>
                  </section>

                  <div className="vih-cart-content-grid">
                    <div className="vih-cart-products-column">
                  <section className="vih-cart-section">
                    <div className="vih-cart-section-title">
                      <h3>Productos</h3>
                      <span>{cartCount} item{cartCount === 1 ? "" : "s"}</span>
                    </div>
                    <div className="vih-cart-items">
                      {cart.map((item, idx) => {
                        const image = productImage(item.producto, idx, shopImages);
                        const lineTotal = item.producto.precio * item.cantidad;

                        return (
                          <article key={item.producto.id} className="vih-cart-item">
                            <div
                              className="vih-cart-item-media"
                              style={{
                                backgroundImage: image ? `url(${image})` : undefined,
                              }}
                            >
                              {!image && <Icon name="ShoppingBag" size={22} />}
                            </div>
                            <div className="vih-cart-item-main">
                              <div className="vih-cart-item-title">
                                <div>
                                  <p className="vih-cart-name">{item.producto.nombre}</p>
                                  <p className="vih-cart-meta">
                                    {formatMoney(item.producto.precio)} c/u - Stock {item.producto.stock}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="vih-icon-btn vih-icon-btn-danger vih-press"
                                  onClick={() => removeFromCart(item.producto.id)}
                                  aria-label={`Quitar ${item.producto.nombre}`}
                                >
                                  <Icon name="Trash" size={16} />
                                </button>
                              </div>
                              <div className="vih-cart-item-actions">
                                <div className="vih-cart-qty">
                                  <button
                                    type="button"
                                    className="vih-icon-btn vih-press"
                                    onClick={() => changeQuantity(item.producto.id, -1)}
                                    aria-label="Disminuir"
                                  >
                                    <Icon name="Minus" size={15} />
                                  </button>
                                  <span>{item.cantidad}</span>
                                  <button
                                    type="button"
                                    className="vih-icon-btn vih-press"
                                    onClick={() => changeQuantity(item.producto.id, 1)}
                                    disabled={item.cantidad >= item.producto.stock}
                                    aria-label="Aumentar"
                                  >
                                    <Icon name="Plus" size={15} />
                                  </button>
                                </div>
                                <strong>{formatMoney(lineTotal)}</strong>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                    </div>

                    <div className="vih-cart-details-column">
                  <section className="vih-cart-section">
                    <div className="vih-cart-section-title">
                      <h3>Entrega</h3>
                      <span>Coordinada</span>
                    </div>
                    <label className="vih-input vih-cart-address">
                      <span className="vih-label-text">Dirección de envío<span className="vih-required" aria-hidden="true">*</span></span>
                      <textarea
                        value={direccion}
                        onChange={(event) => setDireccion(event.target.value)}
                        placeholder="Calle 123 # 45-67, apto, barrio o referencia"
                        rows={3}
                        required
                      />
                    </label>
                    <div className="vih-cart-delivery-note">
                      <Icon name="MapPin" size={18} />
                      <p>Un aliado confirma la entrega cuando el pedido quede pagado.</p>
                    </div>
                  </section>

                  <section className="vih-cart-section">
                    <div className="vih-cart-section-title">
                      <h3>Método de pago<span className="vih-required" aria-hidden="true">*</span></h3>
                      <span>Simulado</span>
                    </div>
                    <div className="vih-payment-methods" role="radiogroup" aria-label="Método de pago">
                      {METODOS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          className={`vih-payment-method ${metodo === m.value ? "is-active" : ""}`}
                          onClick={() => setMetodo(m.value)}
                          role="radio"
                          aria-checked={metodo === m.value}
                        >
                          <Icon name={m.value === "tarjeta" ? "CreditCard" : "Wallet"} size={17} />
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                    </div>
                  </div>
                </div>

                <footer className="vih-cart-summary">
                  <div className="vih-cart-total-row">
                    <span>Subtotal productos</span>
                    <strong>{formatMoney(subtotal)}</strong>
                  </div>
                  <div className="vih-cart-total-row">
                    <span>Envío domicilio</span>
                    <strong>Incluido</strong>
                  </div>
                  <div className="vih-cart-total-row is-total">
                    <span>Total a pagar</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                  <button
                    type="button"
                    className="vih-primary vih-cart-confirm"
                    onClick={() => void handleCheckout()}
                    disabled={checkout}
                  >
                    <Icon name="CreditCard" size={18} />
                    {checkout ? "Procesando pago..." : "Proceder al pago"}
                  </button>
                  <p className="vih-cart-secure-copy">
                    Al confirmar se crea tu pedido y se registra el pago en Vet-In-House.
                  </p>
                </footer>
              </>
            )}
          </aside>
        </div>
        </DialogPortal>
      )}
    </section>
  );
}

function productImage(producto: Producto, index: number, images: PetShopImage[]) {
  if (producto.fotoUrl) return producto.fotoUrl;
  if (images.length === 0) return "";

  const normalized = `${producto.nombre} ${producto.categoria}`.toLowerCase();
  const match = images.find((image) =>
    image.tags
      .toLowerCase()
      .split(",")
      .some((tag) => normalized.includes(tag.trim())),
  );

  return (match ?? images[index % images.length])?.imageUrl ?? "";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
