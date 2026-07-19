import { Product, toTranslations } from '../../../domain/model/Product';
import { ProductCategory } from '../../../domain/model/ProductCategory';

/**
 * İlk kurulum verisi (üreticinin gerçek fotoğraflarıyla).
 *
 * Bu veri iki amaçla kullanılır:
 *  • Veritabanı YOKKEN in-memory depoyu doldurmak (görseller /images/ dosyaları).
 *  • Postgres ilk açılışta boşsa; her ürünün fotoğrafı `image` yolundan okunup
 *    `images` tablosuna (bytea) yazılır ve ürün ona bağlanır (görseller DB'den).
 *
 * Türkçe ad/açıklama üstte; İngilizce ve Almanca çeviriler `translations` içinde.
 * Fiyatlar 0 (kuruş) başlar — üretici panelden gerçek fiyatları girer.
 */
interface SeedEntry {
  slug: string;
  category: ProductCategory;
  /** Turkish (default) name + description. */
  name: string;
  description: string;
  /** Other languages. */
  translations: {
    en: { name: string; description: string };
    de: { name: string; description: string };
  };
  /** /images altındaki dosya — DB'ye taşınacak fotoğraf. */
  image: string;
  featured: boolean;
  order: number;
}

const DOLLS: SeedEntry[] = [
  { slug: 'maymun-momo', category: 'doll', name: 'Maymun Momo',
    description: 'Yumuşacık kadife iple örülen, kulağında minik çiçeğiyle uzun kollu, sarılmalık bir maymun.',
    translations: {
      en: { name: 'Momo the Monkey', description: 'A long-armed, huggable monkey crocheted in soft velvet yarn, with a tiny flower on its ear.' },
      de: { name: 'Momo der Affe', description: 'Ein langarmiger Kuschelaffe aus weichem Samtgarn, mit einer kleinen Blume am Ohr.' },
    },
    image: '/images/doll-monkey.jpeg', featured: true, order: 1 },
  { slug: 'cicekli-inek-yonca', category: 'doll', name: 'Çiçekli İnek Yonca',
    description: 'Bulut beyazı kadife iple örülen, pembe yanaklı ve leylak-krem çiçek taçlı sevimli bir inek.',
    translations: {
      en: { name: 'Yonca the Flower Cow', description: 'A sweet cow crocheted in cloud-white velvet yarn, with pink cheeks and a lilac-and-cream flower crown.' },
      de: { name: 'Yonca die Blumenkuh', description: 'Eine süße Kuh aus wolkenweißem Samtgarn, mit rosa Wangen und einem Blumenkranz in Flieder und Creme.' },
    },
    image: '/images/doll-cow-flowers.jpeg', featured: true, order: 2 },
  { slug: 'mavi-tavsan-pamuk', category: 'doll', name: 'Mavi Tavşan Pamuk',
    description: 'Uzun sarkık kulaklı, gri fiyonklu, tozlu mavi bir tavşan. Ağırlıklı ayaklarıyla rafta oturabilir.',
    translations: {
      en: { name: 'Pamuk the Blue Bunny', description: 'A dusty-blue bunny with long floppy ears and a grey bow. Weighted feet let it sit on a shelf.' },
      de: { name: 'Pamuk der blaue Hase', description: 'Ein staubblauer Hase mit langen Schlappohren und grauer Schleife. Dank beschwerter Füße sitzt er im Regal.' },
    },
    image: '/images/doll-bunny-blue.jpeg', featured: true, order: 3 },
  { slug: 'civciv-limoncuk', category: 'doll', name: 'Civciv Limoncuk',
    description: 'Güneş sarısı, mor bereli ve turuncu botlu; azıcık utangaç, azıcık yaramaz bir civciv.',
    translations: {
      en: { name: 'Limoncuk the Chick', description: 'A sun-yellow chick in a purple beret and orange boots — a little shy, a little cheeky.' },
      de: { name: 'Limoncuk das Küken', description: 'Ein sonnengelbes Küken mit lila Baskenmütze und orangefarbenen Stiefeln — ein bisschen schüchtern, ein bisschen frech.' },
    },
    image: '/images/doll-duckling.jpeg', featured: false, order: 4 },
  { slug: 'pembe-tavsan-gul', category: 'doll', name: 'Pembe Tavşan Gül',
    description: 'Uzun kulaklı, minik fiyonklu, pembe yanaklı bir tavşan. En yumuşak pofuduk iple örüldü.',
    translations: {
      en: { name: 'Gül the Pink Bunny', description: 'A long-eared bunny with a tiny bow and pink cheeks, crocheted in the softest fluffy yarn.' },
      de: { name: 'Gül der rosa Hase', description: 'Ein langohriger Hase mit winziger Schleife und rosa Wangen, gehäkelt aus flauschigstem Garn.' },
    },
    image: '/images/doll-bunny-pink.jpeg', featured: false, order: 5 },
  { slug: 'inek-bal', category: 'doll', name: 'İnek Bal',
    description: 'Krem ve bal rengi, kulaklarında minik örgü çiçekleri olan, kendi başına ayakta durabilen bir inek.',
    translations: {
      en: { name: 'Bal the Cow', description: 'A cream-and-honey cow with tiny crocheted flowers on its ears that can stand on its own.' },
      de: { name: 'Bal die Kuh', description: 'Eine creme- und honigfarbene Kuh mit kleinen gehäkelten Blumen an den Ohren, die von allein steht.' },
    },
    image: '/images/doll-cow-orange.jpeg', featured: false, order: 6 },
  { slug: 'leylak-tavsan-menekse', category: 'doll', name: 'Leylak Tavşan Menekşe',
    description: 'Kar beyazı, mor fırfırlı elbisesi ve kulak fiyonğuyla atölyenin en şık tavşanı.',
    translations: {
      en: { name: 'Menekşe the Lilac Bunny', description: "Snow-white, with a purple ruffled dress and an ear bow — the studio's most elegant bunny." },
      de: { name: 'Menekşe der Fliederhase', description: 'Schneeweiß, mit lila Rüschenkleid und Ohrschleife — der eleganteste Hase des Ateliers.' },
    },
    image: '/images/doll-bunny-lilac.jpeg', featured: false, order: 7 },
  { slug: 'kedi-minnos', category: 'doll', name: 'Kedi Tom',
    description: 'Büyük kulaklı, gri-beyaz, muzip gülüşlü; yumuşak kadifeden, keçe detaylı gözleri ve bıyıklarıyla bir kedi.',
    translations: {
      en: { name: 'Tom the Cat', description: 'A big-eared, grey-and-white cat with a mischievous grin, in soft velvet with felt-detailed eyes and whiskers.' },
      de: { name: 'Tom die Katze', description: 'Eine großohrige, grau-weiße Katze mit schelmischem Lächeln, aus weichem Samt mit Filzaugen und Schnurrhaaren.' },
    },
    image: '/images/doll-cat.jpeg', featured: false, order: 8 },
];

const BAGS: SeedEntry[] = [
  { slug: 'camel-orgu-zincirli-canta', category: 'bag', name: 'Camel Örgü Zincirli Çanta',
    description: 'Camel renkli kalın iple örülen, örgü desenli ve altın rengi zincir askılı gösterişli bir çanta.',
    translations: {
      en: { name: 'Camel Woven Chain Bag', description: 'A statement bag crocheted in thick camel yarn with a woven pattern and a gold-tone chain strap.' },
      de: { name: 'Kamelfarbene Tasche mit Kette', description: 'Eine auffällige Tasche aus dickem kamelfarbenem Garn mit Flechtmuster und goldfarbenem Kettenriemen.' },
    },
    image: '/images/bag-woven-camel.jpeg', featured: true, order: 1 },
  { slug: 'krem-orgu-zincirli-canta', category: 'bag', name: 'Krem Örgü Zincirli Çanta',
    description: 'Krem renkli kalın iple örülen, örgü desenli ve altın rengi zincir askılı zarif bir omuz çantası.',
    translations: {
      en: { name: 'Cream Woven Chain Bag', description: 'An elegant shoulder bag crocheted in thick cream yarn with a woven pattern and a gold-tone chain strap.' },
      de: { name: 'Cremefarbene Tasche mit Kette', description: 'Eine elegante Schultertasche aus dickem cremefarbenem Garn mit Flechtmuster und goldfarbenem Kettenriemen.' },
    },
    image: '/images/bag-woven-cream.jpeg', featured: false, order: 2 },
  { slug: 'pudra-kapakli-zincirli-canta', category: 'bag', name: 'Pudra Kapaklı Zincirli Çanta',
    description: 'Pudra pembesi örgü desenli; altın rengi kilit ve zincir askılı, kapaklı bir çanta.',
    translations: {
      en: { name: 'Powder-Pink Flap Bag', description: 'A flap bag in a powder-pink woven pattern, with a gold-tone clasp and chain strap.' },
      de: { name: 'Puderrosa Tasche mit Klappe', description: 'Eine Klappentasche im puderrosa Flechtmuster, mit goldfarbenem Verschluss und Kettenriemen.' },
    },
    image: '/images/bag-woven-rose.jpeg', featured: false, order: 3 },
  { slug: 'gumus-isilti-el-cantasi', category: 'bag', name: 'Gümüş Işıltı El Çantası',
    description: 'Işıltılı gümüş iple sıkı sıkı örülen, yumuşak hatlı davetlik bir el çantası (clutch).',
    translations: {
      en: { name: 'Silver Shimmer Clutch', description: 'An evening clutch crocheted tightly in shimmering silver yarn, with soft, rounded lines.' },
      de: { name: 'Silberne Glitzer-Clutch', description: 'Eine Abend-Clutch, fest gehäkelt aus schimmerndem Silbergarn, mit weichen, runden Linien.' },
    },
    image: '/images/bag-clutch-silver.jpeg', featured: false, order: 4 },
  { slug: 'siyah-krem-cizgili-portfoy', category: 'bag', name: 'Siyah-Krem Çizgili Portföy',
    description: 'Siyah ve krem çizgileriyle örülen, her kombine uyan şık bir portföy çanta.',
    translations: {
      en: { name: 'Black & Cream Striped Clutch', description: 'A chic clutch crocheted in black and cream stripes that goes with any outfit.' },
      de: { name: 'Schwarz-cremefarbene gestreifte Clutch', description: 'Eine schicke Clutch, gehäkelt in schwarz-cremefarbenen Streifen, die zu jedem Outfit passt.' },
    },
    image: '/images/bag-clutch-striped.jpeg', featured: false, order: 5 },
  { slug: 'siyah-kabartma-kol-cantasi', category: 'bag', name: 'Siyah Kabartma Kol Çantası',
    description: 'Kabartma (popcorn) örgü tekniğiyle örülen, tek kulplu, yuvarlak hatlı siyah bir kol çantası.',
    translations: {
      en: { name: 'Black Popcorn Shoulder Bag', description: 'A round, single-handle black shoulder bag crocheted in the popcorn-stitch technique.' },
      de: { name: 'Schwarze Popcorn-Schultertasche', description: 'Eine runde schwarze Schultertasche mit einem Henkel, gehäkelt in Popcorn-Technik.' },
    },
    image: '/images/bag-hobo-black.jpeg', featured: false, order: 6 },
  { slug: 'payetli-mini-cuzdan', category: 'bag', name: 'Payetli Mini Cüzdan',
    description: 'El örgüsü gri bozuk para cüzdanı; klik-klak kapağı, altın rengi payetleri ve anahtarlığıyla minik bir dost.',
    translations: {
      en: { name: 'Sequined Mini Coin Purse', description: 'A handmade grey coin purse — a tiny friend with a click-clack clasp, gold sequins and a keyring.' },
      de: { name: 'Mini-Geldbörse mit Pailletten', description: 'Eine handgemachte graue Münzbörse — ein winziger Begleiter mit Klick-Klack-Verschluss, goldenen Pailletten und Schlüsselring.' },
    },
    image: '/images/bag-coin-purse-grey.jpeg', featured: false, order: 7 },
];

/** Raw seed entry (file-backed image) — consumed by the Postgres seeder. */
export type CatalogSeedEntry = SeedEntry;
export const CATALOG_SEED_ENTRIES: readonly SeedEntry[] = Object.freeze([...DOLLS, ...BAGS]);

/** Full Product objects (for the in-memory repository / no-DB mode). */
export const CATALOG_SEED: readonly Product[] = Object.freeze(
  CATALOG_SEED_ENTRIES.map((e) => ({
    id: e.slug,
    slug: e.slug,
    category: e.category,
    name: e.name,
    description: e.description,
    translations: toTranslations({
      tr: { name: e.name, description: e.description },
      en: e.translations.en,
      de: e.translations.de,
    }),
    priceCents: 0,
    currency: 'TRY',
    imageId: null,
    image: e.image, // static file path in no-DB mode
    etsyUrl: '#etsy-link',
    instagramUrl: '#instagram-dm',
    featured: e.featured,
    order: e.order,
  })),
);
