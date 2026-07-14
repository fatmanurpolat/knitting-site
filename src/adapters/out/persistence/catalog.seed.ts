import { Product } from '../../../domain/model/Product';

/**
 * Ürün kataloğu (başlangıç verisi).
 *
 * Tüm oyuncaklar ve çantalar üreticinin gerçek fotoğraflarını kullanır
 * (/public/images).
 *
 * ── NASIL DÜZENLENİR (panel gelene kadar) ────────────────────────────────
 *  • Aşağıdaki dizileri düzenleyerek ürün ekleyin / çıkarın / sıralayın.
 *  • `image`        → /public/images içindeki bir dosya.
 *  • `etsyUrl`      → bu ürünün Etsy VEYA Amazon ilanı. '#etsy-link' bırakılırsa
 *                     kartta "Sipariş için yazın" (Instagram / WhatsApp) görünür.
 *  • `instagramUrl` → ürüne ait Instagram gönderisi/DM (varsayılan: site geneli).
 *  • `featured`     → ana sayfada öne çıkar.
 *  • REPLACE işaretli metinler örnek metinlerdir — üreticinin kendi sözleriyle
 *    değiştirin.
 * ─────────────────────────────────────────────────────────────────────────
 */

const DOLLS: Product[] = [
  {
    id: 'doll-monkey',
    slug: 'maymun-momo',
    category: 'doll',
    name: 'Maymun Momo', // REPLACE
    description:
      'Yumuşacık kadife iple örülen, kulağında minik çiçeğiyle uzun kollu, sarılmalık bir maymun.', // REPLACE
    image: '/images/doll-monkey.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: true,
    order: 1,
  },
  {
    id: 'doll-cow-flowers',
    slug: 'cicekli-inek-yonca',
    category: 'doll',
    name: 'Çiçekli İnek Yonca', // REPLACE
    description:
      'Bulut beyazı kadife iple örülen, pembe yanaklı ve leylak-krem çiçek taçlı sevimli bir inek.', // REPLACE
    image: '/images/doll-cow-flowers.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: true,
    order: 2,
  },
  {
    id: 'doll-bunny-blue',
    slug: 'mavi-tavsan-pamuk',
    category: 'doll',
    name: 'Mavi Tavşan Pamuk', // REPLACE
    description:
      'Uzun sarkık kulaklı, gri fiyonklu, tozlu mavi bir tavşan. Ağırlıklı ayaklarıyla rafta oturabilir.', // REPLACE
    image: '/images/doll-bunny-blue.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: true,
    order: 3,
  },
  {
    id: 'doll-duckling',
    slug: 'civciv-limoncuk',
    category: 'doll',
    name: 'Civciv Limoncuk', // REPLACE
    description:
      'Güneş sarısı, mor bereli ve turuncu botlu; azıcık utangaç, azıcık yaramaz bir civciv.', // REPLACE
    image: '/images/doll-duckling.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 4,
  },
  {
    id: 'doll-bunny-pink',
    slug: 'pembe-tavsan-gul',
    category: 'doll',
    name: 'Pembe Tavşan Gül', // REPLACE
    description:
      'Uzun kulaklı, minik fiyonklu, pembe yanaklı bir tavşan. En yumuşak pofuduk iple örüldü.', // REPLACE
    image: '/images/doll-bunny-pink.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 5,
  },
  {
    id: 'doll-cow-orange',
    slug: 'inek-bal',
    category: 'doll',
    name: 'İnek Bal', // REPLACE
    description:
      'Krem ve bal rengi, kulaklarında minik örgü çiçekleri olan, kendi başına ayakta durabilen bir inek.', // REPLACE
    image: '/images/doll-cow-orange.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 6,
  },
  {
    id: 'doll-bunny-lilac',
    slug: 'leylak-tavsan-menekse',
    category: 'doll',
    name: 'Leylak Tavşan Menekşe', // REPLACE
    description:
      'Kar beyazı, mor fırfırlı elbisesi ve kulak fiyonğuyla atölyenin en şık tavşanı.', // REPLACE
    image: '/images/doll-bunny-lilac.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 7,
  },
  {
    id: 'doll-cat',
    slug: 'kedi-minnos',
    category: 'doll',
    name: 'Kedi Minnoş', // REPLACE
    description:
      'Büyük kulaklı, gri-beyaz, muzip gülüşlü; yumuşak kadifeden, keçe detaylı gözleri ve bıyıklarıyla bir kedi.', // REPLACE
    image: '/images/doll-cat.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 8,
  },
];

const BAGS: Product[] = [
  {
    id: 'bag-woven-camel',
    slug: 'camel-orgu-zincirli-canta',
    category: 'bag',
    name: 'Camel Örgü Zincirli Çanta', // REPLACE
    description:
      'Camel renkli kalın iple örülen, örgü desenli ve altın rengi zincir askılı gösterişli bir çanta.', // REPLACE
    image: '/images/bag-woven-camel.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: true,
    order: 1,
  },
  {
    id: 'bag-woven-cream',
    slug: 'krem-orgu-zincirli-canta',
    category: 'bag',
    name: 'Krem Örgü Zincirli Çanta', // REPLACE
    description:
      'Krem renkli kalın iple örülen, örgü desenli ve altın rengi zincir askılı zarif bir omuz çantası.', // REPLACE
    image: '/images/bag-woven-cream.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 2,
  },
  {
    id: 'bag-woven-rose',
    slug: 'pudra-kapakli-zincirli-canta',
    category: 'bag',
    name: 'Pudra Kapaklı Zincirli Çanta', // REPLACE
    description:
      'Pudra pembesi örgü desenli; altın rengi kilit ve zincir askılı, kapaklı bir çanta.', // REPLACE
    image: '/images/bag-woven-rose.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 3,
  },
  {
    id: 'bag-clutch-silver',
    slug: 'gumus-isilti-el-cantasi',
    category: 'bag',
    name: 'Gümüş Işıltı El Çantası', // REPLACE
    description:
      'Işıltılı gümüş iple sıkı sıkı örülen, yumuşak hatlı davetlik bir el çantası (clutch).', // REPLACE
    image: '/images/bag-clutch-silver.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 4,
  },
  {
    id: 'bag-clutch-striped',
    slug: 'siyah-krem-cizgili-portfoy',
    category: 'bag',
    name: 'Siyah-Krem Çizgili Portföy', // REPLACE
    description:
      'Siyah ve krem çizgileriyle örülen, her kombine uyan şık bir portföy çanta.', // REPLACE
    image: '/images/bag-clutch-striped.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 5,
  },
  {
    id: 'bag-hobo-black',
    slug: 'siyah-kabartma-kol-cantasi',
    category: 'bag',
    name: 'Siyah Kabartma Kol Çantası', // REPLACE
    description:
      'Kabartma (popcorn) örgü tekniğiyle örülen, tek kulplu, yuvarlak hatlı siyah bir kol çantası.', // REPLACE
    image: '/images/bag-hobo-black.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 6,
  },
  {
    id: 'bag-coin-purse-grey',
    slug: 'payetli-mini-cuzdan',
    category: 'bag',
    name: 'Payetli Mini Cüzdan', // REPLACE
    description:
      'El örgüsü gri bozuk para cüzdanı; klik-klak kapağı, altın rengi payetleri ve anahtarlığıyla minik bir dost.', // REPLACE
    image: '/images/bag-coin-purse-grey.jpeg',
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: false,
    order: 7,
  },
];

/** Depoyu başlangıçta dolduran, değiştirilemez katalog verisi. */
export const CATALOG_SEED: readonly Product[] = Object.freeze([...DOLLS, ...BAGS]);
