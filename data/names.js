// Proper names the engine should keep capitalized.
// Add new names to the right list; keep the official spelling (İ/I, ş, ç…).
// AMBIGUOUS: names that are also ordinary words (Deniz = sea, Umut = hope).
// They are kept, but flagged so you can lowercase them if the word was meant.

export const FIRST_NAMES = `
Ahmet Mehmet Mustafa Ali Hüseyin Hasan İbrahim İsmail Osman Yusuf Murat Ömer Ramazan Halil Süleyman Abdullah
Mahmut Recep Salih Fatih Kadir Emre Hakan Adem Kemal Yaşar Bayram Serkan Burak Ercan Erkan Orhan Okan Volkan
Gökhan Cengiz Tuncay Tuncer Selim Sinan Tolga Uğur Umut Can Cem Cemal Cemil Cihan Deniz Doğan Ege Emir Enes
Engin Eren Erdem Erdoğan Ersin Ertan Ertuğrul Ferhat Fikret Furkan Gürkan Hamza Harun Hikmet Hilmi İlhan İlker
İsa Kaan Kenan Kerem Kubilay Levent Mert Metin Mesut Musa Necati Nihat Nuri Oğuz Oğuzhan Onur Ozan Özgür Rıza
Rıfat Sait Sami Selçuk Serdar Sezer Şükrü Tamer Tarık Taner Tayfun Turgay Turgut Ufuk Utku Vedat Yasin Yavuz
Yiğit Yunus Zafer Zeki Barış Batuhan Berk Berkay Bora Bülent Celal Coşkun Doruk Efe Egemen Emrah Erhan Erol
Ethem Faruk Fuat Gökay Gökmen Halit Haluk Hayati Hayri Hulusi İlyas İrfan Kamil Kâmil Kazım Koray Kutay Mahir
Melih Mithat Muhammed Muhammet Muharrem Mücahit Namık Necdet Nedim Nevzat Niyazi Nurettin Orçun Ömür Önder
Polat Reşat Rüstem Sabri Sadık Savaş Sedat Semih Sercan Şahin Şenol Şevket Talha Tahsin Tevfik Timur Tuğrul
Turan Ümit Vahit Veli Yakup Yalçın Yılmaz Yücel Zekeriya Alper Alp Arda Aras Atakan Atilla Aydın Aykut Baran
Berkan Burhan Caner Çağan Çağatay Çağlar Çetin Doğukan Ekrem Eray Erdal Ergün Ferit Görkem Güven Hakkı Hüsnü
İhsan İlkay İsmet Kadri Kürşat Latif Lütfi Mazhar Mevlüt Muammer Nail Nazım Necip Rahmi Rasim Sefa Selahattin
Seyit Suat Şeref Tahir Tunç Uğurcan Vehbi Yener Yüksel Ozan Tuna Kağan Mirac Miraç Eymen Ayaz Kuzey Poyraz
Çınar Aslan Kartal Toprak Güney Kerim Hakkı Nusret Cevdet Cevat Kenan Raşit Haydar Cafer Abdurrahman Ahmet
Fatma Ayşe Emine Hatice Zeynep Elif Meryem Şerife Zehra Sultan Hanife Merve Havva Zeliha Esra Fadime Özlem
Hacer Melek Yasemin Rabia Hülya Cennet Kübra Leyla Dilek Gül Sevgi Songül Derya Esma Aynur Büşra Ebru Emel
Filiz Gamze Gizem Gülay Gülsüm Hande İpek Kader Melike Nur Nuray Nurten Pınar Seda Selin Serap Sevda Sibel
Tuğba Tülay Ümran Yeliz Zerrin Ayten Aysel Ayla Arzu Aslı Asuman Aylin Ayşegül Azra Bahar Banu Begüm Belgin
Berna Berrin Betül Beyza Burcu Canan Ceren Cansu Damla Defne Didem Duygu Dilara Ece Ecem Eda Ela Elçin Esin
Feride Funda Gönül Gülşen Gülten Hilal Irmak Işıl Işık İlknur İrem Kevser Lale Meltem Mine Müge Nalan Nazlı
Neslihan Nesrin Nihan Nilay Nilüfer Oya Öykü Özge Pelin Perihan Reyhan Saadet Sanem Selma Sema Semra Serpil
Sevim Sevil Seher Sinem Şule Şeyma Tuba Tülin Yağmur Yeşim Zuhal Zübeyde Ahu Bengü Buse Cemre Çiğdem Dilan
Esen Eylül Fulya Gökçe Gülizar Hale Hazal Helin Ilgın Jale Mehtap Melis Meral Nermin Nevin Nil Nurcan Nursel
Rukiye Sabiha Saliha Seval Sıla Şebnem Şenay Şükran Tuğçe Ülkü Yaprak Yıldız Zümrüt Aysun Gülden Gülnur Nuran
Saniye Semiha Sevinç Necla Nebahat Mihriban Naciye Nazife Remziye Hayriye Sadiye Fikriye Medine Ruken Aliye
Asya Elif Eslem Nehir Zehra Ecrin Masal Hiranur Duru Lina Elisa Ada Alya Mira Bade Begüm Gülbahar Aslıhan
Ayşenur Fatmanur Sümeyye Hümeyra Kezban Nazmiye Emel Nurhan Gülcan Sevgül Tuğçe Selda Sezen Ajda Tarkan Barış
`;

export const SURNAMES = `
Yılmaz Kaya Demir Şahin Çelik Yıldız Yıldırım Öztürk Aydın Özdemir Arslan Doğan Kılıç Aslan Çetin Kara Koç Kurt
Özkan Şimşek Polat Özcan Korkmaz Çakır Erdoğan Yavuz Can Acar Şen Aktaş Güler Yalçın Güneş Bozkurt Bulut Keskin
Ünal Turan Gül Özer Işık Kaplan Avcı Sarı Tekin Taş Köse Yüksel Ateş Aksoy Yiğit Uçar Akın Karataş Akbulut Sönmez
Altun Kaçar Sezer Coşkun Bayram Tunç Durmaz Toprak Çiftçi Ekinci Tuncer Eren Akgül Özgür Baysal Erdem Karakaya
Uysal Ay Dinç Akyüz Bilgin Kocabaş Önal Cömert Gündoğdu Kalkan Türk Altıntaş Karaca Yücel Oral Duman Özbek Tan
Er Ergün Kahraman Bayrak Akdoğan Kartal Demirci Taşkın Uslu Temiz Aydoğan Güven Bilgiç Erol Sağlam Çakmak Pehlivan
Topal Kurtuluş Atalay Altın Akça Erbaş Tatlı Gündüz Savaş Yaman Kuru Ekici Aydemir Kocaman Akkaya Başaran Soylu
Esen Avşar Atatürk İnönü Gökalp Ersoy Pamuk Kemal Hikmet
`;

export const PLACES = `
Türkiye Adana Adıyaman Afyonkarahisar Afyon Ağrı Amasya Ankara Antalya Artvin Aydın Balıkesir Bilecik Bingöl
Bitlis Bolu Burdur Bursa Çanakkale Çankırı Çorum Denizli Diyarbakır Edirne Elazığ Erzincan Erzurum Eskişehir
Gaziantep Antep Giresun Gümüşhane Hakkari Hatay Antakya Isparta Mersin İstanbul İzmir Kars Kastamonu Kayseri
Kırklareli Kırşehir Kocaeli İzmit Konya Kütahya Malatya Manisa Kahramanmaraş Maraş Mardin Muğla Muş Nevşehir
Niğde Ordu Rize Sakarya Adapazarı Samsun Siirt Sinop Sivas Tekirdağ Tokat Trabzon Tunceli Şanlıurfa Urfa Uşak
Van Yozgat Zonguldak Aksaray Bayburt Karaman Kırıkkale Batman Şırnak Bartın Ardahan Iğdır Yalova Karabük Kilis
Osmaniye Düzce Kadıköy Beşiktaş Üsküdar Şişli Beyoğlu Bakırköy Kartal Maltepe Ataşehir Sarıyer Beykoz Esenyurt
Bağcılar Pendik Ümraniye Eminönü Taksim Nişantaşı Moda Bebek Ortaköy Karaköy Cihangir Levent Etiler Bostancı
Kağıthane Kâğıthane Çankaya Kızılay Keçiören Yenimahalle Etimesgut Karşıyaka Bornova Alsancak Konak Buca Çeşme
Bodrum Marmaris Fethiye Kaş Alanya Kuşadası Didim Ayvalık Kapadokya Göreme Pamukkale Efes Boğaziçi Anadolu
Trakya Karadeniz Akdeniz Ege Marmara Kızılırmak Fırat Dicle Erciyes Uludağ Ağrı Avrupa Asya Afrika Amerika
Almanya Fransa İngiltere İtalya İspanya Rusya Çin Japonya Hollanda Belçika Yunanistan Bulgaristan Gürcistan
Azerbaycan İran Irak Suriye Mısır Arabistan Kanada Avustralya Hindistan Kore İsviçre İsveç Norveç Danimarka
Polonya Avusturya Ukrayna Portekiz Brezilya Arjantin Meksika Kıbrıs Londra Paris Berlin Roma Moskova Amsterdam
Brüksel Viyana Atina Bakü Tiflis Dubai Mekke Medine Kudüs Bağdat Şam Kahire Tahran Pekin Tokyo
`;

// Peoples, languages, religion and other words that are always capitalized.
export const OTHER = `
Türk Alman Fransız İngiliz İtalyan İspanyol Amerikalı Rus Çinli Japon Kürt Arap Yunan Ermeni Laz Çerkez Gürcü
Azeri Türkçe İngilizce Almanca Fransızca İtalyanca İspanyolca Rusça Arapça Kürtçe Japonca Çince Farsça Yunanca
Allah Tanrı Peygamber İslam Müslüman Hristiyan Kuran Ramazan Kurban
`;

// Brands and apps. Lowercase forms of these are corrected to this spelling.
export const BRANDS = `
WhatsApp Netflix Instagram YouTube Google Facebook Twitter TikTok Spotify iPhone iPad Apple Samsung Xiaomi Huawei
Microsoft Trendyol Hepsiburada Yemeksepeti Migros BİM A101 Turkcell Vodafone THY Pegasus Starbucks McDonald’s
IKEA Uber BiTaksi Telegram LinkedIn ChatGPT Gmail Outlook PowerPoint Disney Exxen BluTV Mercedes BMW Toyota
Renault Fiat Tofaş Arçelik Vestel Ziraat Akbank Papara PTT TRT İTÜ ODTÜ NATO TDK YouTuber Snapchat Pinterest
PlayStation Nintendo Android Windows Excel Zoom
`;

// Brands that are also everyday words: never auto-cased from lowercase.
export const BRAND_NO_AUTOCASE = new Set(['apple', 'zoom', 'excel', 'windows', 'android', 'migros', 'bim', 'thy', 'ptt', 'trt', 'tdk', 'nato', 'itü', 'odtü', 'mercedes', 'fiat', 'disney', 'pegasus', 'outlook']);

export const AMBIGUOUS = new Set(`
Deniz Umut Barış Can Gül Güneş Bahar Yağmur Nur Yıldız Ay Derya Ece Ela Lale Melek Sevgi Sultan Kader Cennet
Irmak Işık Mine Oya Pınar Sema Sıla Yaprak Zümrüt Ümit Savaş Polat Doğan Kaplan Aslan Arslan Kartal Şahin Toprak
Bulut Kaya Demir Çelik Kara Koç Kurt Sarı Taş Ateş Altın Altun Gündüz Tatlı Temiz Sağlam Kuru Uysal Keskin Cömert
Yaman Duman Türk Şen Güler Uçar Durmaz Korkmaz Yılmaz Sönmez Ekinci Avcı Çiftçi Ekici Demirci Tan Er Esen Güven
Coşkun Bayram Yüksel Yücel Ozan Efe Emir Ege Mert Önder Tunç Alp Bora Baran Ömür Engin Erdem Hikmet Hilal
Kevser Saadet Ahu Eylül Defne Damla Çiğdem Cemre Hale Nil Seher Ramazan Kurban Van Ordu Ağrı Boğaz Kaş Moda
Bebek Konak Tokat Aydın Fatih Batman Levent Pamuk Masal Nehir Duru Ada Bade Tuna Kuzey Poyraz Çınar Güney
Toprak Atalay Akın Taşkın Karaca Bilgin Kalkan Özgür Erol Mesut Sevinç Seval Jale Selda Sanem Kerim Asya Kemal
Hayat Gökçe Ilgın Işıl Peygamber Tanrı Kuran Uslu Topal Pehlivan Ersoy Medine Alman Japon Rus Arap Laz
`.trim().split(/\s+/));

const words = s => s.trim().split(/\s+/).filter(Boolean);
export const ALL_NAMES = [...new Set([...words(FIRST_NAMES), ...words(SURNAMES), ...words(PLACES), ...words(OTHER), ...words(BRANDS)])];
export const BRAND_LIST = words(BRANDS);
