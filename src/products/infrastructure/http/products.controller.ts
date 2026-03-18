import { Controller, Get, Post, Param, NotFoundException, Query, Body } from '@nestjs/common';
import { ProductsService } from '../../application/products.service';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// DTO local para validación y transformación
export class FilterProductsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() filters: FilterProductsDto) {
    return this.productsService.getAllProducts(filters);
  }

  @Get(':sku')
  async findOne(@Param('sku') sku: string) {
    const product = await this.productsService.getProductBySku(sku);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Post(':sku/reviews')
  async addReview(
    @Param('sku') sku: string,
    @Body() reviewData: { userName: string; rating: number; comment: string }
  ) {
    const product = await this.productsService.addReviewToProduct(sku, reviewData as any);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Post('seed')
  async seed() {
    const productsSeed = [
      // 1-10 Laptops (Real Info)
      { 
        name: 'MacBook Pro 14 M3', 
        sku: 'MBP-14-M3', 
        brand: 'Apple', 
        basePrice: 1999, 
        categories: ['Laptops'], 
        images: ['https://www.apple.com/v/macbook-pro/ak/images/overview/welcome/hero_endframe__e9v6gn886ms2_large.jpg'], 
        officialUrl: 'https://www.apple.com/macbook-pro/',
        specifications: { cpu: 'M3 Pro', ram: '16GB', storage: '512GB SSD' }, 
        description: 'The most advanced chips ever built for a personal computer.' 
      },
      { 
        name: 'Dell XPS 13', 
        sku: 'DELL-XPS-13', 
        brand: 'Dell', 
        basePrice: 1299, 
        categories: ['Laptops'], 
        images: ['https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9340/media-gallery/silver/touch/laptop-xps-13-9340-t-silver-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2077&qlt=100,1&resMode=sharp2&size=3491,2077&chrss=full&imwidth=5000'], 
        officialUrl: 'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop/spd/xps-13-9340-laptop',
        specifications: { cpu: 'Intel Core Ultra 7', ram: '16GB', storage: '512GB SSD' }, 
        description: 'Iconic design. Immersive 13.4-inch display. All-day battery life.' 
      },
      { 
        name: 'ASUS ROG Zephyrus G14', 
        sku: 'ASUS-ROG-G14', 
        brand: 'ASUS', 
        basePrice: 1599, 
        categories: ['Laptops', 'Gaming'], 
        images: ['https://dlcdnwebimgs.asus.com/gain/06800063-8CE3-4A1E-B6BD-68000638CE3F/w1000/h732'], 
        officialUrl: 'https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g14-2024/',
        specifications: { cpu: 'Ryzen 9', gpu: 'RTX 4060', ram: '16GB' }, 
        description: 'The world’s most powerful 14-inch gaming laptop is back and better than ever.' 
      },
      { 
        name: 'Lenovo ThinkPad X1 Carbon Gen 12', 
        sku: 'THINK-X1-C', 
        brand: 'Lenovo', 
        basePrice: 1450, 
        categories: ['Laptops', 'Business'], 
        images: ['https://p1-ofp.static.pub//fes/cms/2023/12/14/ovsvvmd8iv68ofskvgt60nyv6aq60v144143.png'], 
        officialUrl: 'https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpadx1/thinkpad-x1-carbon-gen-12-(14-inch-intel)/len101t0083',
        specifications: { cpu: 'Intel Core Ultra 5', ram: '32GB' }, 
        description: 'Legendary durability and professional-grade performance.' 
      },
      { 
        name: 'Razer Blade 15', 
        sku: 'RAZER-B15', 
        brand: 'Razer', 
        basePrice: 2499, 
        categories: ['Laptops', 'Gaming'], 
        images: ['https://assets2.razerzone.com/images/pnx.assets/07996dfcc00066cd6060606060606060/razer-blade-15-2023-laptop-500x500.png'], 
        officialUrl: 'https://www.razer.com/gaming-laptops/razer-blade-15',
        specifications: { gpu: 'RTX 4080', screen: '240Hz QHD' }, 
        description: 'The ultimate 15-inch gaming laptop, now featuring more power than ever.' 
      },

      // Resto de productos (con placeholders por ahora)
      { name: 'HP Spectre x360', sku: 'HP-SPEC-360', brand: 'HP', basePrice: 1100, categories: ['Laptops'], images: ['https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=800'], specifications: { features: 'Convertible 2-in-1' }, description: 'Versatile and elegant.' },
      { name: 'Acer Swift 5', sku: 'ACER-SW5', brand: 'Acer', basePrice: 899, categories: ['Laptops'], images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'], specifications: { weight: '1kg' }, description: 'Feather-light portable.' },
      { name: 'Surface Laptop 5', sku: 'MS-SURF-5', brand: 'Microsoft', basePrice: 999, categories: ['Laptops'], images: ['https://images.unsplash.com/photo-1661961111184-11273050ad82?auto=format&fit=crop&q=80&w=800'], specifications: { display: 'PixelSense' }, description: 'Premium Microsoft experience.' },
      { name: 'Samsung Galaxy Book3', sku: 'SAM-GB3', brand: 'Samsung', basePrice: 1399, categories: ['Laptops'], images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'], specifications: { display: 'AMOLED' }, description: 'Powerful Galaxy ecosystem integration.' },
      { name: 'MSI Stealth 16', sku: 'MSI-ST16', brand: 'MSI', basePrice: 1899, categories: ['Laptops', 'Gaming'], images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800'], specifications: { gpu: 'RTX 4070' }, description: 'Slim and powerful gaming.' },

      // 11-20 Periféricos
      { name: 'Logitech MX Master 3S', sku: 'LOGI-MX3S', brand: 'Logitech', basePrice: 99, categories: ['Mice'], images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&q=80&w=800'], specifications: { sensor: '8K DPI', connectivity: 'Logi Bolt' }, description: 'Ultimate productivity mouse.' },
      { name: 'Keychron Q1 Pro', sku: 'KC-Q1P', brand: 'Keychron', basePrice: 199, categories: ['Keyboards'], images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800'], specifications: { type: 'Mechanical', layout: '75%' }, description: 'Premium custom keyboard.' },
      { name: 'SteelSeries Apex Pro', sku: 'SS-APEX-PRO', brand: 'SteelSeries', basePrice: 179, categories: ['Keyboards'], images: ['https://images.unsplash.com/photo-1595225405011-5120a11612e3?auto=format&fit=crop&q=80&w=800'], specifications: { switches: 'OmniPoint' }, description: 'Fastest mechanical keyboard.' },
      { name: 'Razer DeathAdder V3', sku: 'RZ-DAV3', brand: 'Razer', basePrice: 149, categories: ['Mice'], images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800'], specifications: { weight: '63g' }, description: 'Pro-grade gaming mouse.' },
      { name: 'HyperX QuadCast S', sku: 'HX-QC-S', brand: 'HyperX', basePrice: 159, categories: ['Audio'], images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800'], specifications: { lighting: 'RGB' }, description: 'Professional USB microphone.' },
      { name: 'Sony WH-1000XM5', sku: 'SONY-XM5', brand: 'Sony', basePrice: 349, categories: ['Audio'], images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'], specifications: { anc: 'Industry leading' }, description: 'Best noise-canceling headphones.' },
      { name: 'Bose QuietComfort Ultra', sku: 'BOSE-QCU', brand: 'Bose', basePrice: 429, categories: ['Audio'], images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'], specifications: { audio: 'Immersive' }, description: 'Top-tier comfort and sound.' },
      { name: 'Elgato Stream Deck MK.2', sku: 'ELG-SD-MK2', brand: 'Elgato', basePrice: 149, categories: ['Accessories'], images: ['https://images.unsplash.com/photo-1563333393-e7f0107b2245?auto=format&fit=crop&q=80&w=800'], specifications: { keys: '15 LCD' }, description: 'Streamline your workflow.' },
      { name: 'Wacom Intuos Pro', sku: 'WACOM-IP', brand: 'Wacom', basePrice: 299, categories: ['Design'], images: ['https://images.unsplash.com/photo-1585332959449-b4a185e49bca?auto=format&fit=crop&q=80&w=800'], specifications: { pressure: '8192 levels' }, description: 'Pro tablet for digital artists.' },
      { name: 'Blue Yeti Nano', sku: 'BLUE-YN', brand: 'Logitech', basePrice: 99, categories: ['Audio'], images: ['https://images.unsplash.com/photo-1598550476439-6847785fce66?auto=format&fit=crop&q=80&w=800'], specifications: { pattern: 'Cardioid/Omni' }, description: 'Compact USB mic.' },

      // 21-30 Monitores
      { name: 'LG UltraGear 27GP850', sku: 'LG-UG-27', brand: 'LG', basePrice: 399, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'], specifications: { hz: '180Hz', panel: 'Nano IPS' }, description: 'Best all-around gaming monitor.' },
      { name: 'Samsung Odyssey G9', sku: 'SAM-OD-G9', brand: 'Samsung', basePrice: 1299, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=800'], specifications: { size: '49 inch', curve: '1000R' }, description: 'Ultrawide immersive experience.' },
      { name: 'Dell UltraSharp U2723QE', sku: 'DELL-US-27', brand: 'Dell', basePrice: 599, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&q=80&w=800'], specifications: { resolution: '4K', tech: 'IPS Black' }, description: 'Stunning clarity for pros.' },
      { name: 'ASUS ProArt PA329C', sku: 'ASUS-PA32', brand: 'ASUS', basePrice: 899, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&q=80&w=800'], specifications: { color: '100% Adobe RGB' }, description: 'Color-accurate for designers.' },
      { name: 'BenQ ZOWIE XL2546K', sku: 'BENQ-XL25', brand: 'BenQ', basePrice: 499, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'], specifications: { hz: '240Hz' }, description: 'Esports standard.' },
      { name: 'Alienware AW3423DWF', sku: 'AW-QD-OLED', brand: 'Dell', basePrice: 1099, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&q=80&w=800'], specifications: { panel: 'QD-OLED' }, description: 'Best gaming panel technology.' },
      { name: 'Gigabyte M27Q', sku: 'GIGA-M27Q', brand: 'Gigabyte', basePrice: 299, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1593359677777-a3d1377462a8?auto=format&fit=crop&q=80&w=800'], specifications: { kvm: 'Built-in' }, description: 'Best value 1440p monitor.' },
      { name: 'ViewSonic VP2785-4K', sku: 'VS-VP27', brand: 'ViewSonic', basePrice: 650, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&q=80&w=800'], specifications: { resolution: '4K' }, description: 'Professional color monitor.' },
      { name: 'AOC C24G1', sku: 'AOC-C24', brand: 'AOC', basePrice: 180, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'], specifications: { hz: '144Hz' }, description: 'Budget gaming entry.' },
      { name: 'Eizo Coloredge CG2700S', sku: 'EIZO-CG27', brand: 'Eizo', basePrice: 2100, categories: ['Monitors'], images: ['https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&q=80&w=800'], specifications: { sensor: 'Built-in calibration' }, description: 'Absolute pro color.' },

      // 31-40 Almacenamiento y Componentes
      { name: 'Samsung 990 Pro 2TB', sku: 'SAM-990-2TB', brand: 'Samsung', basePrice: 179, categories: ['Storage'], images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800'], specifications: { speed: '7450 MB/s', gen: 'PCIe 4.0' }, description: 'Fastest consumer SSD.' },
      { name: 'RTX 4090 Founders', sku: 'NV-4090-FE', brand: 'NVIDIA', basePrice: 1599, categories: ['GPU'], images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800'], specifications: { vram: '24GB GDDR6X' }, description: 'Performance king.' },
      { name: 'Ryzen 7 7800X3D', sku: 'AMD-7800X3D', brand: 'AMD', basePrice: 449, categories: ['CPU'], images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800'], specifications: { cache: '96MB L3' }, description: 'Best gaming CPU.' },
      { name: 'Intel i9-14900K', sku: 'INT-14900K', brand: 'Intel', basePrice: 589, categories: ['CPU'], images: ['https://images.unsplash.com/photo-1580584126903-c17d41830450?auto=format&fit=crop&q=80&w=800'], specifications: { cores: '24 cores' }, description: 'Ultimate multi-core power.' },
      { name: 'Corsair Vengeance 32GB', sku: 'COR-VG-32', brand: 'Corsair', basePrice: 120, categories: ['RAM'], images: ['https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=800'], specifications: { speed: '6000MHz DDR5' }, description: 'High-speed memory.' },
      { name: 'Crucial T700 1TB', sku: 'CRU-T700-1', brand: 'Crucial', basePrice: 169, categories: ['Storage'], images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800'], specifications: { gen: 'PCIe 5.0' }, description: 'Next-gen storage speed.' },
      { name: 'WD Black SN850X', sku: 'WD-SN850X', brand: 'WD', basePrice: 149, categories: ['Storage'], images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800'], specifications: { size: '2TB' }, description: 'Reliable high-speed SSD.' },
      { name: 'NZXT Kraken Elite', sku: 'NZXT-KRA-EL', brand: 'NZXT', basePrice: 279, categories: ['Cooling'], images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800'], specifications: { lcd: 'Built-in LCD' }, description: 'AIO with customizable screen.' },
      { name: 'ASUS ROG Thor 1200W', sku: 'ASUS-THOR-12', brand: 'ASUS', basePrice: 320, categories: ['PSU'], images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800'], specifications: { rating: '80+ Platinum' }, description: 'Premium power supply.' },
      { name: 'Lian Li O11 Dynamic', sku: 'LIAN-O11D', brand: 'Lian Li', basePrice: 150, categories: ['Case'], images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800'], specifications: { glass: 'Tempered' }, description: 'Legendary PC case.' },

      // 41-50 Otros Dispositivos
      { name: 'iPad Pro 12.9 M2', sku: 'IPAD-PRO-12', brand: 'Apple', basePrice: 1099, categories: ['Tablets'], images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800'], specifications: { screen: 'Mini-LED' }, description: 'Power of a Mac in a tablet.' },
      { name: 'Nintendo Switch OLED', sku: 'NIN-SW-OLED', brand: 'Nintendo', basePrice: 349, categories: ['Consoles'], images: ['https://images.unsplash.com/photo-1578303372704-14f089ac9129?auto=format&fit=crop&q=80&w=800'], specifications: { screen: '7 inch OLED' }, description: 'Best handheld experience.' },
      { name: 'PlayStation 5 Slim', sku: 'SONY-PS5-SL', brand: 'Sony', basePrice: 499, categories: ['Consoles'], images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800'], specifications: { drive: 'Disc Edition' }, description: 'Next-gen gaming redefined.' },
      { name: 'Xbox Series X', sku: 'MS-XBX', brand: 'Microsoft', basePrice: 499, categories: ['Consoles'], images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&q=80&w=800'], specifications: { power: '12 TFLOPS' }, description: 'Most powerful console.' },
      { name: 'Steam Deck OLED', sku: 'VALVE-SD-OLED', brand: 'Valve', basePrice: 549, categories: ['Consoles', 'PC'], images: ['https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=800'], specifications: { battery: '50Wh' }, description: 'Best PC handheld.' },
      { name: 'Meta Quest 3', sku: 'META-Q3', brand: 'Meta', basePrice: 499, categories: ['VR'], images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=800'], specifications: { resolution: '4K+ Infinite Display' }, description: 'Immersive VR experience.' },
      { name: 'GoPro HERO12 Black', sku: 'GP-H12', brand: 'GoPro', basePrice: 399, categories: ['Cameras'], images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'], specifications: { resolution: '5.3K' }, description: 'Best action camera.' },
      { name: 'Kindle Paperwhite', sku: 'AMZ-KIND-PW', brand: 'Amazon', basePrice: 139, categories: ['Tablets'], images: ['https://images.unsplash.com/photo-1592434134753-a70baf7979d7?auto=format&fit=crop&q=80&w=800'], specifications: { screen: 'e-ink' }, description: 'Ultimate reading device.' },
      { name: 'DJI Mini 4 Pro', sku: 'DJI-M4P', brand: 'DJI', basePrice: 759, categories: ['Drones'], images: ['https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800'], specifications: { weight: '249g' }, description: 'Professional sub-250g drone.' },
      { name: 'Apple Watch Ultra 2', sku: 'AW-ULTRA-2', brand: 'Apple', basePrice: 799, categories: ['Wearables'], images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'], specifications: { brightness: '3000 nits' }, description: 'Ultimate adventurer watch.' }
    ];

    await this.productsService.runSeed(productsSeed as any);
    return { message: 'Seed successful: 50 Products added to MongoDB with HD images' };
  }
}
