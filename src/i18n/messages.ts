import { Locale } from '../domain/model/Locale';

/**
 * All user-facing UI copy, per language. The domain/application layers never see
 * this — it belongs to the delivery edge (templates via the view model).
 *
 * Conventions:
 *  • `{brand}` is replaced with the configured brand name at render time.
 *  • Keys ending in "Html" contain inline markup and must be printed unescaped
 *    (`<%- %>`) in templates; everything else is plain text (`<%= %>`).
 *
 * The `Messages` interface forces every locale to define exactly the same keys,
 * so a missing translation is a compile error, not a blank spot on the page.
 */
export interface Messages {
  nav: {
    home: string; story: string; dolls: string; bags: string; contact: string;
    menuOpen: string; menuLabel: string; langLabel: string;
  };
  meta: Record<'home' | 'story' | 'dolls' | 'bags' | 'contact', { title: string; description: string }>;
  footer: { tagline: string; email: string; contact: string; handmade: string };
  home: {
    eyebrow: string; titleHtml: string; lede: string; ctaDolls: string; ctaBags: string;
    heroImgAlt: string; heroNote: string; featuredEyebrow: string; featuredTitle: string; more: string;
    galleryEyebrow: string; galleryTitle: string; strip1: string; strip2: string; strip3: string;
    quote: string; storyCta: string;
  };
  story: {
    eyebrow: string; title: string; portraitAlt: string; caption: string; lead1: string; pull1: string; lead2: string;
    processEyebrow: string; processTitle: string;
    step1Alt: string; step1Title: string; step1Text: string;
    step2Alt: string; step2Title: string; step2Text: string;
    step3Alt: string; step3Title: string; step3Text: string;
    closingLede: string; closingQuote: string; closingCta: string;
  };
  dolls: { eyebrow: string; title: string; lede: string; empty: string; stripCta: string; stripBtn: string };
  bags: { eyebrow: string; title: string; lede: string; empty: string; stripCta: string; stripBtn: string };
  contact: {
    eyebrow: string; title: string; lede: string;
    igTitle: string; igText: string; igBtn: string;
    waTitle: string; waText: string; waBtn: string;
    emailTitle: string; emailText: string; emailBtn: string;
    gridEyebrow: string; gridTitle: string; gridAlt: string;
  };
  notFound: { eyebrow: string; title: string; leadPre: string; leadPost: string; backHome: string; seeDolls: string };
  card: { noImage: string; shopAmazon: string; shopEtsy: string; shopGeneric: string; order: string; questions: string };
}

const tr: Messages = {
  nav: {
    home: 'Anasayfa', story: 'Hikayemiz', dolls: 'Oyuncaklar', bags: 'Çantalar', contact: 'İletişim',
    menuOpen: 'Menüyü aç', menuLabel: 'Ana menü', langLabel: 'Dil seçin',
  },
  meta: {
    home: { title: '', description: 'İplikle, sabırla ve sevgiyle; tek tek elde örülüyor.' },
    story: { title: 'Hikayemiz', description: '{brand} nasıl başladı ve her ilmeğin arkasındaki eller.' },
    dolls: { title: 'Oyuncaklar', description: 'El örgüsü amigurumi oyuncaklar, her biri tek tek örülüyor.' },
    bags: { title: 'Çantalar', description: 'Her güne ve özel günlere el örgüsü çantalar.' },
    contact: { title: 'İletişim', description: 'Merhaba deyin, soru sorun ya da bizi takip edin.' },
  },
  footer: {
    tagline: 'İplikle, sabırla ve sevgiyle; tek tek elde örülüyor.',
    email: 'E-posta', contact: 'İletişim', handmade: 'Her ürün elde yapılır.',
  },
  home: {
    eyebrow: 'El örgüsü · siparişe özel',
    titleHtml: 'Minik dostlar ve günlük çantalar, <span class="script">elde örülüyor.</span>',
    lede: '{brand}, örgü oyuncaklar ve çantalar üreten minik bir atölye. Her ürün; güzel ipliklerden, sabırla ve tek tek, ilmek ilmek örülüyor — bu yüzden hiçbiri bir diğerinin tıpatıp aynısı değil.',
    ctaDolls: 'Oyuncakları keşfet', ctaBags: 'Çantaları gör',
    heroImgAlt: 'El örgüsü bir maymun, çocuk odasında', heroNote: 'güzel bir köşede',
    featuredEyebrow: 'Birkaç favori', featuredTitle: 'Yeni tamamlananlar', more: 'Hepsine göz atın →',
    galleryEyebrow: 'Minik ailemiz', galleryTitle: 'Hepsi tek tek, elde',
    strip1: 'El emeğinin zarafetiyle şekillenen özel tasarım.',
    strip2: 'Doğal pamuk ve yün; minik ellere nazik.',
    strip3: 'Kişiselleştirilmiş tasarım — Renk paletinizi kendiniz belirleyin.',
    quote: '“Her ilmek, acele etmeden, sabırla ve sevgiyle atılıyor.”',
    storyCta: 'Hikayemizi okuyun',
  },
  story: {
    eyebrow: 'Hikayemiz',
    title: 'İplerin renklerine ve dokusuna duyduğum merak, beni evimin en sevdiğim köşesinde kendi kendime ilk ilmeği atmaya kadar götürdü.',
    portraitAlt: 'Çalışma masasında, iplik sepetleri arasında üretici', caption: 'merhaba, ben Mediha',
    lead1: 'Bizim hikayemiz büyük atölyelerde, seri üretim makinelerinin gürültüsünde değil; evin en sessiz, en huzurlu köşesinde yazılıyor. Burada her ilmek, acele etmeden, sabırla ve sevgiyle atılıyor.',
    pull1: 'El emeğiyle yapılan her ürünün bir ruhu, her rengin de anlatacak bir hikayesi vardır.',
    lead2: 'Tasarımdan son ilmeğe kadar tüm süreç tek bir elden, ev sıcaklığında şekilleniyor. Amacımız sadece bir örgü ürünü ortaya çıkarmak değil; size o sıcaklığı, özeni ve her detaya sinmiş emeği hissettirebilmek.',
    processEyebrow: 'Bir ürün nasıl yapılır', processTitle: 'Bir yumak iplikten bir dosta',
    step1Alt: 'Şişlerle bir yumak iplik', step1Title: 'İpin seçimi',
    step1Text: 'Her ürün; doğal iplikleri ve birbirine yakışan renkleri —çoğu zaman sizin istediklerinizi— seçmekle başlar.',
    step2Alt: 'Koltuğunda örgü ören üretici', step2Title: 'İlmeklerin örülmesi',
    step2Text: 'Gövde, tek bir iplikle kesintisiz örülür; sonra biçimini koruyacak şekilde azar azar dolgulanır.',
    step3Alt: 'Çiçek taçlı tamamlanmış örgü inek', step3Title: 'Son dokunuşlar',
    step3Text: 'Yüzler elde işlenir, detaylar dikilir ve her ürün yeni evine gitmeden önce tek tek kontrol edilir.',
    closingLede: 'Kendi dünyamızda, yavaş ve özenle ürettiğimiz bu güzellikleri sizinle paylaşabilmek en büyük mutluluğumuz.',
    closingQuote: 'Dünyamıza ve hikayemize ortak olduğunuz için teşekkür ederiz.', closingCta: 'Bize ulaşın',
  },
  dolls: {
    eyebrow: 'Oyuncaklar', title: 'Minik dostlar, tek tek elde.',
    lede: 'Kişiye özel renk seçimleriyle tamamen el yapımı ve eşsiz oyuncaklar. Siz renklerinizi seçin, biz size özel sevgiyle örelim.',
    empty: 'Yeni ürünler tezgahta — yakında tekrar göz atın.',
    stripCta: 'Aradığınızı bulamadınız mı? Size özel örmeyi çok severim.', stripBtn: 'Size özel oyuncak isteyin',
  },
  bags: {
    eyebrow: 'Çantalar', title: 'Her güne, her şıklığa çantalar.',
    lede: 'Sağlam, yumuşak ve kullanılmak için yapıldı. Her çanta doğal ipliklerden elde örülür ve taşıdıkça daha da güzelleşir.',
    empty: 'Yeni ürünler tezgahta — yakında tekrar göz atın.',
    stripCta: 'Kendi renklerinizde ister misiniz?', stripBtn: 'Size özel çanta isteyin',
  },
  contact: {
    eyebrow: 'Merhaba deyin', title: 'Birlikte bir şeyler yapalım.',
    lede: 'Size özel sipariş, bir soru ya da sadece merhaba demek için — bana en hızlı ulaşabileceğiniz yer Instagram. Gelen her mesajı okuyorum.',
    igTitle: 'Instagram', igText: 'Size özel siparişler ve kısa sorular için en iyisi.', igBtn: 'Instagram’dan yazın',
    waTitle: 'WhatsApp', waText: 'Sohbet etmeyi mi seversiniz? Sipariş için doğrudan yazın.', waBtn: 'WhatsApp’tan yazın',
    emailTitle: 'E-posta', emailText: 'Bir mesajdan fazlasını gerektiren her şey için.', emailBtn: 'E-posta gönderin',
    gridEyebrow: 'Bizi takip edin', gridTitle: 'Atölyeden', gridAlt: 'Atölyeden',
  },
  notFound: {
    eyebrow: '404', title: 'Bir ilmek kaçmış gibi görünüyor.',
    leadPre: '', leadPost: ' sayfasını bulamadık. Sizi geri götürelim.',
    backHome: 'Anasayfaya dön', seeDolls: 'Oyuncakları gör',
  },
  card: {
    noImage: 'görsel yok', shopAmazon: 'Amazon’dan al', shopEtsy: 'Etsy’den al', shopGeneric: 'Ürünü incele',
    order: 'Sipariş için yazın', questions: 'Sorular için:',
  },
};

const en: Messages = {
  nav: {
    home: 'Home', story: 'Our Story', dolls: 'Toys', bags: 'Bags', contact: 'Contact',
    menuOpen: 'Open menu', menuLabel: 'Main menu', langLabel: 'Choose language',
  },
  meta: {
    home: { title: '', description: 'With yarn, patience and love; crocheted one by one, by hand.' },
    story: { title: 'Our Story', description: 'How {brand} began, and the hands behind every stitch.' },
    dolls: { title: 'Toys', description: 'Handmade amigurumi toys, each crocheted one at a time.' },
    bags: { title: 'Bags', description: 'Handmade crochet bags for every day and special occasions.' },
    contact: { title: 'Contact', description: 'Say hello, ask a question, or follow along.' },
  },
  footer: {
    tagline: 'With yarn, patience and love; crocheted one by one, by hand.',
    email: 'Email', contact: 'Contact', handmade: 'Every piece is handmade.',
  },
  home: {
    eyebrow: 'Handmade · made to order',
    titleHtml: 'Little friends and everyday bags, <span class="script">crocheted by hand.</span>',
    lede: '{brand} is a tiny studio making crocheted toys and bags. Every piece is worked stitch by stitch from beautiful yarns, patiently and one at a time — so no two are ever exactly alike.',
    ctaDolls: 'Explore the toys', ctaBags: 'See the bags',
    heroImgAlt: 'A handmade crochet monkey in a child’s room', heroNote: 'in a sunny corner',
    featuredEyebrow: 'A few favorites', featuredTitle: 'Freshly finished', more: 'Browse them all →',
    galleryEyebrow: 'Our little family', galleryTitle: 'Each one by hand',
    strip1: 'A special design shaped by the elegance of handwork.',
    strip2: 'Natural cotton and wool — gentle for little hands.',
    strip3: 'Personalized design — choose your own color palette.',
    quote: '“Every stitch is made without haste, with patience and love.”',
    storyCta: 'Read our story',
  },
  story: {
    eyebrow: 'Our Story',
    title: 'My curiosity about the colors and textures of yarn led me, in my favorite corner of the house, to make my very first stitch on my own.',
    portraitAlt: 'The maker at her worktable among baskets of yarn', caption: 'hello, I’m Mediha',
    lead1: 'Our story isn’t written in big workshops or the noise of mass-production machines, but in the quietest, most peaceful corner of the home. Here every stitch is made without haste, with patience and love.',
    pull1: 'Every handmade piece has a soul, and every color has a story to tell.',
    lead2: 'From the design to the final stitch, the whole process is shaped by a single pair of hands, in the warmth of home. Our aim isn’t just to make a crocheted piece, but to let you feel that warmth, care and the effort woven into every detail.',
    processEyebrow: 'How a piece is made', processTitle: 'From a ball of yarn to a friend',
    step1Alt: 'A ball of yarn with crochet hooks', step1Title: 'Choosing the yarn',
    step1Text: 'Every piece starts with choosing natural yarns and colors that go together — often the ones you ask for.',
    step2Alt: 'The maker crocheting in her armchair', step2Title: 'Working the stitches',
    step2Text: 'The body is crocheted from a single continuous thread, then filled little by little so it keeps its shape.',
    step3Alt: 'A finished crochet cow with a flower crown', step3Title: 'Finishing touches',
    step3Text: 'Faces are embroidered by hand, details are sewn on, and every piece is checked one by one before it goes to its new home.',
    closingLede: 'Sharing with you these beautiful things we make slowly and with care, in our own little world, is our greatest joy.',
    closingQuote: 'Thank you for being part of our world and our story.', closingCta: 'Get in touch',
  },
  dolls: {
    eyebrow: 'Toys', title: 'Little friends, each by hand.',
    lede: 'Every toy is crocheted to order and takes a few evenings. Tell me the colors you love and I’ll make one just for you.',
    empty: 'New pieces are on the hook — check back soon.',
    stripCta: 'Didn’t find what you were looking for? I’d love to make one just for you.', stripBtn: 'Request a custom toy',
  },
  bags: {
    eyebrow: 'Bags', title: 'Bags for every day and every occasion.',
    lede: 'Sturdy, soft, and made to be used. Every bag is crocheted by hand from natural yarns and only gets more beautiful as you carry it.',
    empty: 'New pieces are on the hook — check back soon.',
    stripCta: 'Would you like it in your own colors?', stripBtn: 'Request a custom bag',
  },
  contact: {
    eyebrow: 'Say hello', title: 'Let’s make something together.',
    lede: 'For a custom order, a question, or just to say hello — Instagram is the fastest way to reach me. I read every message.',
    igTitle: 'Instagram', igText: 'Best for custom orders and quick questions.', igBtn: 'Message on Instagram',
    waTitle: 'WhatsApp', waText: 'Prefer to chat? Message directly to order.', waBtn: 'Message on WhatsApp',
    emailTitle: 'Email', emailText: 'For anything that needs more than a quick message.', emailBtn: 'Send an email',
    gridEyebrow: 'Follow along', gridTitle: 'From the studio', gridAlt: 'From the studio',
  },
  notFound: {
    eyebrow: '404', title: 'Looks like a stitch slipped.',
    leadPre: 'We couldn’t find ', leadPost: '. Let’s get you back on track.',
    backHome: 'Back to home', seeDolls: 'See the toys',
  },
  card: {
    noImage: 'no image', shopAmazon: 'Buy on Amazon', shopEtsy: 'Buy on Etsy', shopGeneric: 'View the piece',
    order: 'Message to order', questions: 'Questions:',
  },
};

const de: Messages = {
  nav: {
    home: 'Startseite', story: 'Unsere Geschichte', dolls: 'Spielsachen', bags: 'Taschen', contact: 'Kontakt',
    menuOpen: 'Menü öffnen', menuLabel: 'Hauptmenü', langLabel: 'Sprache wählen',
  },
  meta: {
    home: { title: '', description: 'Mit Garn, Geduld und Liebe; einzeln von Hand gehäkelt.' },
    story: { title: 'Unsere Geschichte', description: 'Wie {brand} begann und die Hände hinter jeder Masche.' },
    dolls: { title: 'Spielsachen', description: 'Handgemachte Amigurumi-Spielsachen, jede einzeln gehäkelt.' },
    bags: { title: 'Taschen', description: 'Handgehäkelte Taschen für jeden Tag und besondere Anlässe.' },
    contact: { title: 'Kontakt', description: 'Sagen Sie Hallo, stellen Sie eine Frage oder folgen Sie uns.' },
  },
  footer: {
    tagline: 'Mit Garn, Geduld und Liebe; einzeln von Hand gehäkelt.',
    email: 'E-Mail', contact: 'Kontakt', handmade: 'Jedes Stück ist handgemacht.',
  },
  home: {
    eyebrow: 'Handgemacht · auf Bestellung',
    titleHtml: 'Kleine Freunde und Taschen für jeden Tag, <span class="script">von Hand gehäkelt.</span>',
    lede: '{brand} ist ein kleines Atelier für gehäkelte Spielsachen und Taschen. Jedes Stück wird Masche für Masche aus schönen Garnen gearbeitet, geduldig und einzeln — deshalb gleicht keines dem anderen.',
    ctaDolls: 'Spielsachen entdecken', ctaBags: 'Taschen ansehen',
    heroImgAlt: 'Ein handgehäkelter Affe im Kinderzimmer', heroNote: 'in einer sonnigen Ecke',
    featuredEyebrow: 'Ein paar Favoriten', featuredTitle: 'Frisch fertiggestellt', more: 'Alle ansehen →',
    galleryEyebrow: 'Unsere kleine Familie', galleryTitle: 'Jedes einzeln, von Hand',
    strip1: 'Ein besonderes Design, geformt von der Eleganz der Handarbeit.',
    strip2: 'Natürliche Baumwolle und Wolle — sanft zu kleinen Händen.',
    strip3: 'Individuelles Design — bestimmen Sie Ihre eigene Farbpalette.',
    quote: '„Jede Masche entsteht ohne Eile, mit Geduld und Liebe.“',
    storyCta: 'Unsere Geschichte lesen',
  },
  story: {
    eyebrow: 'Unsere Geschichte',
    title: 'Meine Neugier auf die Farben und Texturen des Garns führte mich in meiner Lieblingsecke des Hauses dazu, ganz allein meine allererste Masche zu machen.',
    portraitAlt: 'Die Macherin an ihrem Arbeitstisch zwischen Garnkörben', caption: 'hallo, ich bin Mediha',
    lead1: 'Unsere Geschichte wird nicht in großen Werkstätten oder im Lärm von Maschinen geschrieben, sondern in der ruhigsten, friedlichsten Ecke des Zuhauses. Hier entsteht jede Masche ohne Eile, mit Geduld und Liebe.',
    pull1: 'Jedes handgemachte Stück hat eine Seele, und jede Farbe hat eine Geschichte zu erzählen.',
    lead2: 'Vom Entwurf bis zur letzten Masche entsteht der gesamte Prozess in einer einzigen Hand, in der Wärme des Zuhauses. Unser Ziel ist nicht nur, ein gehäkeltes Stück zu schaffen, sondern Sie diese Wärme, Sorgfalt und die in jedes Detail eingearbeitete Mühe spüren zu lassen.',
    processEyebrow: 'Wie ein Stück entsteht', processTitle: 'Vom Wollknäuel zum Freund',
    step1Alt: 'Ein Wollknäuel mit Häkelnadeln', step1Title: 'Die Auswahl des Garns',
    step1Text: 'Jedes Stück beginnt mit der Wahl natürlicher Garne und zusammenpassender Farben — oft genau der, die Sie sich wünschen.',
    step2Alt: 'Die Macherin häkelt in ihrem Sessel', step2Title: 'Das Häkeln der Maschen',
    step2Text: 'Der Körper wird aus einem einzigen durchgehenden Faden gehäkelt und dann nach und nach gefüllt, damit er seine Form behält.',
    step3Alt: 'Eine fertige gehäkelte Kuh mit Blumenkranz', step3Title: 'Der letzte Schliff',
    step3Text: 'Gesichter werden von Hand bestickt, Details angenäht und jedes Stück wird einzeln geprüft, bevor es in sein neues Zuhause zieht.',
    closingLede: 'Diese schönen Dinge, die wir in unserer eigenen kleinen Welt langsam und mit Sorgfalt fertigen, mit Ihnen zu teilen, ist unsere größte Freude.',
    closingQuote: 'Danke, dass Sie Teil unserer Welt und unserer Geschichte sind.', closingCta: 'Kontakt aufnehmen',
  },
  dolls: {
    eyebrow: 'Spielsachen', title: 'Kleine Freunde, jeder von Hand.',
    lede: 'Jedes Spielzeug wird auf Bestellung gehäkelt und dauert ein paar Abende. Nennen Sie mir Ihre Lieblingsfarben, und ich häkle eines nur für Sie.',
    empty: 'Neue Stücke sind in Arbeit — schauen Sie bald wieder vorbei.',
    stripCta: 'Nicht gefunden, wonach Sie gesucht haben? Ich häkle Ihnen gern ein individuelles Stück.', stripBtn: 'Individuelles Spielzeug anfragen',
  },
  bags: {
    eyebrow: 'Taschen', title: 'Taschen für jeden Tag und jeden Anlass.',
    lede: 'Robust, weich und zum Benutzen gemacht. Jede Tasche wird von Hand aus natürlichen Garnen gehäkelt und wird mit jedem Tragen schöner.',
    empty: 'Neue Stücke sind in Arbeit — schauen Sie bald wieder vorbei.',
    stripCta: 'Möchten Sie sie in Ihren eigenen Farben?', stripBtn: 'Individuelle Tasche anfragen',
  },
  contact: {
    eyebrow: 'Sagen Sie Hallo', title: 'Lassen Sie uns etwas zusammen machen.',
    lede: 'Für eine individuelle Bestellung, eine Frage oder einfach ein Hallo — am schnellsten erreichen Sie mich über Instagram. Ich lese jede Nachricht.',
    igTitle: 'Instagram', igText: 'Am besten für individuelle Bestellungen und kurze Fragen.', igBtn: 'Auf Instagram schreiben',
    waTitle: 'WhatsApp', waText: 'Lieber chatten? Schreiben Sie direkt zur Bestellung.', waBtn: 'Auf WhatsApp schreiben',
    emailTitle: 'E-Mail', emailText: 'Für alles, was mehr als eine kurze Nachricht braucht.', emailBtn: 'E-Mail senden',
    gridEyebrow: 'Folgen Sie uns', gridTitle: 'Aus dem Atelier', gridAlt: 'Aus dem Atelier',
  },
  notFound: {
    eyebrow: '404', title: 'Sieht aus, als wäre eine Masche verrutscht.',
    leadPre: 'Wir konnten die Seite ', leadPost: ' nicht finden. Wir bringen Sie zurück.',
    backHome: 'Zur Startseite', seeDolls: 'Spielsachen ansehen',
  },
  card: {
    noImage: 'kein Bild', shopAmazon: 'Auf Amazon kaufen', shopEtsy: 'Auf Etsy kaufen', shopGeneric: 'Zum Produkt',
    order: 'Zum Bestellen schreiben', questions: 'Fragen:',
  },
};

export const MESSAGES: Record<Locale, Messages> = { tr, en, de };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
