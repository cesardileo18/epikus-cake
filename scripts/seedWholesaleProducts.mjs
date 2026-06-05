// scripts/seedWholesaleProducts.mjs
// Sube los 12 productos del catalogo mayorista estatico a Firestore.
//
// USO:
//   1. Descarga el service account JSON desde Firebase Console:
//      Project Settings > Service Accounts > Generate new private key.
//   2. Guardalo como `serviceAccountKey.json` en la raiz del repo
//      (o exporta SERVICE_ACCOUNT_PATH con la ruta absoluta).
//   3. Corre:  node scripts/seedWholesaleProducts.mjs
//
// El script es IDEMPOTENTE: usa los id originales del JSON como ID de
// documento, asi que correrlo de nuevo solo actualiza esos productos
// (no crea duplicados).

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import admin from 'firebase-admin';

const PRODUCTS = [
  // ── PASCUA ──────────────────────────────────────────────────
  {
    id: 'huevo-pascua',
    nombre: 'Huevo de Pascua',
    descripcion: 'Pasta ballina con detalles en dorado comestible y decoraciones multicolor',
    categoria: 'pascua',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160157/huevoPascua_w5q2pu.jpg',
    precioMayorista: 80,
    packMayorista: 20,
    categoriaMayorista: 'pascua',
    ordenMayorista: 1,
  },
  {
    id: 'zanahoria',
    nombre: 'Zanahoria',
    descripcion: 'Zanahoria de pasta ballina con tallo verde, detalle brillante',
    categoria: 'pascua',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160158/zanahoria_s2ebti.jpg',
    precioMayorista: 70,
    packMayorista: 20,
    categoriaMayorista: 'pascua',
    ordenMayorista: 2,
  },
  {
    id: 'mini-conejo',
    nombre: 'Mini Conejo',
    descripcion: 'Conejo en pasta ballina con moño dorado, acabado artesanal premium',
    categoria: 'pascua',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160151/miniConejo_t4atix.jpg',
    precioMayorista: 60,
    packMayorista: 20,
    categoriaMayorista: 'pascua',
    ordenMayorista: 3,
  },
  {
    id: 'conejo-zanahoria',
    nombre: 'Conejo con Zanahoria',
    descripcion: 'Conejo sosteniendo zanahoria, figura completa con detalles pintados',
    categoria: 'pascua',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160154/conejoB_eogsbb.jpg',
    precioMayorista: 500,
    packMayorista: 4,
    categoriaMayorista: 'pascua',
    ordenMayorista: 4,
  },
  {
    id: 'conejo-estrella',
    nombre: 'Conejo con Estrella',
    descripcion: 'Conejo blanco con estrella azul y detalle dorado',
    categoria: 'pascua',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160155/conejoC_swfby9.jpg',
    precioMayorista: 500,
    packMayorista: 4,
    categoriaMayorista: 'pascua',
    ordenMayorista: 5,
  },
  {
    id: 'conejo-flor',
    nombre: 'Conejo con Flor',
    descripcion: 'Conejo con rosa lila, acabado brillante con purpurina comestible',
    categoria: 'pascua',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160156/conejoA_f3zmgo.jpg',
    precioMayorista: 500,
    packMayorista: 4,
    categoriaMayorista: 'pascua',
    ordenMayorista: 6,
  },

  // ── FLORES ──────────────────────────────────────────────────
  {
    id: 'margarita-clasica',
    nombre: 'Margarita Clásica',
    descripcion: 'Margarita blanca con centro amarillo, pétalos finos y delicados',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160151/margaritaA_uhjudh.jpg',
    precioMayorista: 100,
    packMayorista: 12,
    categoriaMayorista: 'flores',
    ordenMayorista: 1,
  },
  {
    id: 'margarita-glitter',
    nombre: 'Margarita Glitter',
    descripcion: 'Margarita con purpurina comestible, brillo especial para ocasiones',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160151/margaritaB_dwnp0i.jpg',
    precioMayorista: 100,
    packMayorista: 12,
    categoriaMayorista: 'flores',
    ordenMayorista: 2,
  },
  {
    id: 'flor-5-petalos',
    nombre: 'Flor 5 Pétalos',
    descripcion: 'Flor grande en crema con centro lila y purpurina iridiscente',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160152/florA_uiqucy.jpg',
    precioMayorista: 100,
    packMayorista: 12,
    categoriaMayorista: 'flores',
    ordenMayorista: 3,
  },
  {
    id: 'flor-mini',
    nombre: 'Flor Mini 5 Pétalos',
    descripcion: 'Versión mini con glitter, perfecta para cupcakes y petit fours',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160153/florB_v64fdo.jpg',
    precioMayorista: 70,
    packMayorista: 12,
    categoriaMayorista: 'flores',
    ordenMayorista: 4,
  },
  {
    id: 'flor-pequena',
    nombre: 'Flor Pequeña',
    descripcion: 'Flor compacta con purpurina, detalle de centro lila',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160152/florC_rraak8.jpg',
    precioMayorista: 50,
    packMayorista: 30,
    categoriaMayorista: 'flores',
    ordenMayorista: 5,
  },
  {
    id: 'hoja-natural',
    nombre: 'Hoja Natural',
    descripcion: 'Hoja verde con nervaduras en relieve, complemento ideal para flores',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160153/hoja_uzsdca.jpg',
    precioMayorista: 50,
    packMayorista: 30,
    categoriaMayorista: 'flores',
    ordenMayorista: 6,
  },
  {
    id: 'hoja-acebo',
    nombre: 'Hoja Acebo',
    descripcion: 'Hoja dentada verde claro, ideal para arreglos y decoraciones especiales',
    categoria: 'flores',
    imagen: 'https://res.cloudinary.com/dyf6dtb9y/image/upload/v1773160153/muerdago_c4lkw3.jpg',
    precioMayorista: 60,
    packMayorista: 20,
    categoriaMayorista: 'flores',
    ordenMayorista: 7,
  },
];

const COLLECTION = 'productos';

function loadServiceAccount() {
  const customPath = process.env.SERVICE_ACCOUNT_PATH;
  const defaultPath = resolve(process.cwd(), 'serviceAccountKey.json');
  const path = customPath ? resolve(customPath) : defaultPath;

  if (!existsSync(path)) {
    console.error('No se encontro el service account en:', path);
    console.error('');
    console.error('Descargalo desde Firebase Console:');
    console.error('  Project Settings > Service Accounts > Generate new private key');
    console.error('Y guardalo como serviceAccountKey.json en la raiz del repo,');
    console.error('o exporta SERVICE_ACCOUNT_PATH con la ruta absoluta.');
    process.exit(1);
  }

  return JSON.parse(readFileSync(path, 'utf8'));
}

async function main() {
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  console.log(`Subiendo ${PRODUCTS.length} productos a /${COLLECTION} ...`);
  console.log('');

  let creados = 0;
  let actualizados = 0;

  for (const { id, ...data } of PRODUCTS) {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    const yaExiste = snap.exists;

    const payload = {
      ...data,
      activo: true,
      destacado: false,
      mayorista: true,
      tieneVariantes: false,
      precio: data.precioMayorista,
      stock: 0,
      ...(yaExiste ? {} : { fechaCreacion: now }),
    };

    await ref.set(payload, { merge: true });

    if (yaExiste) {
      actualizados += 1;
      console.log(`  ↻ Actualizado:  ${id}`);
    } else {
      creados += 1;
      console.log(`  ✓ Creado:       ${id}`);
    }
  }

  console.log('');
  console.log(`Listo. Creados: ${creados}, actualizados: ${actualizados}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
