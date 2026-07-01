# Styles

La estructura de estilos esta pensada para que cada cambio visual sea facil de ubicar:

- `index.css`: solo carga fundamentos y utilidades realmente compartidas.
- `foundations/`: tokens, reset, fuentes, animaciones y reglas base.
- `shared/`: botones, overlays, feedback y patrones reutilizados por varias features.
- `features/**`: cada pantalla o componente importa su propio `*.css` vecino.
- `app/`: estilos de entrada de la aplicacion.

Regla practica: si una clase solo vive en una vista, su CSS debe estar junto a esa vista. Si se usa en varias features, debe quedarse en `shared/` o en un componente compartido del feature.
