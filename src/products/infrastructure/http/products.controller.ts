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
      // LAPTOPS
      { 
        name: 'MacBook Pro 14 M3 Max', 
        sku: 'MBP-14-M3-MAX', 
        brand: 'Apple', 
        basePrice: 14500000, 
        categories: ['Laptops', 'Apple'], 
        images: [
          'https://www.apple.com/v/macbook-pro/ak/images/overview/welcome/hero_endframe__e9v6gn886ms2_large.jpg',
          'https://www.apple.com/v/macbook-pro/ak/images/overview/design/design_performance__chwsq6237i6u_large.jpg'
        ], 
        specifications: { cpu: 'M3 Max 14-core', ram: '36GB Unified', storage: '1TB SSD' }, 
        description: 'La laptop más potente para profesionales creativos. Pantalla Liquid Retina XDR de 14 pulgadas.' 
      },
      { 
        name: 'ASUS ROG Zephyrus G16 (2024)', 
        sku: 'ASUS-G16-2024', 
        brand: 'ASUS', 
        basePrice: 11800000, 
        categories: ['Laptops', 'Gaming'], 
        images: [
          'https://dlcdnwebimgs.asus.com/gain/06800063-8CE3-4A1E-B6BD-68000638CE3F/w1000/h732',
          'https://dlcdnwebimgs.asus.com/gain/f3e827a4-0a8b-4b2a-a53c-4b534b3f888e/w1000/h732'
        ], 
        specifications: { cpu: 'Intel Core Ultra 9', gpu: 'RTX 4070', ram: '32GB DDR5' }, 
        description: 'Potencia pura en un diseño ultra delgado. Pantalla OLED de 240Hz.' 
      },
      { 
        name: 'Dell XPS 15 9530', 
        sku: 'DELL-XPS-15', 
        brand: 'Dell', 
        basePrice: 9500000, 
        categories: ['Laptops'], 
        images: ['https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/silver/touch/laptop-xps-15-9530-t-silver-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2077&qlt=100,1&resMode=sharp2&size=3491,2077&chrss=full&imwidth=5000'], 
        specifications: { cpu: 'Intel i7-13700H', ram: '32GB', screen: '3.5K OLED Touch' }, 
        description: 'La combinación perfecta de potencia y portabilidad para creadores.' 
      },
      { 
        name: 'Lenovo Legion Slim 5 Gen 8', 
        sku: 'LEN-LEG-S5', 
        brand: 'Lenovo', 
        basePrice: 5900000, 
        categories: ['Laptops', 'Gaming'], 
        images: ['https://p2-ofp.static.pub/fes/cms/2023/03/24/7f5w2a5786v30h5u9e8j60s75q0v6w472304.png'], 
        specifications: { cpu: 'Ryzen 7 7840HS', gpu: 'RTX 4060', ram: '16GB' }, 
        description: 'Rendimiento gaming balanceado con gran sistema de refrigeración.' 
      },

      // COMPONENTES (GPU / CPU)
      { 
        name: 'NVIDIA GeForce RTX 4090 Founders', 
        sku: 'NV-4090-FE', 
        brand: 'NVIDIA', 
        basePrice: 9800000, 
        categories: ['GPU', 'Componentes'], 
        images: ['https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/ada/rtx-4090/geforce-rtx-4090-product-gallery-1.jpg'], 
        specifications: { vram: '24GB GDDR6X', bus: '384-bit', tdp: '450W' }, 
        description: 'La tarjeta gráfica definitiva. Domina el 4K a máxima velocidad.' 
      },
      { 
        name: 'AMD Ryzen 7 7800X3D', 
        sku: 'AMD-7800X3D', 
        brand: 'AMD', 
        basePrice: 1950000, 
        categories: ['CPU', 'Componentes'], 
        images: ['https://images.admiralcloud.com/v2/get/5c6b9b3e-5b6d-4b8a-9b3e-5b6d4b8a9b3e'], 
        specifications: { cores: '8-Cores', threads: '16-Threads', cache: '96MB L3' }, 
        description: 'El mejor procesador del mundo para gaming gracias a su tecnología 3D V-Cache.' 
      },
      { 
        name: 'Intel Core i9-14900K', 
        sku: 'INT-14900K', 
        brand: 'Intel', 
        basePrice: 2850000, 
        categories: ['CPU', 'Componentes'], 
        images: ['https://www.intel.com/content/dam/www/central-libraries/us/en/images/i9-badge-16x9.png.rendition.intel.480.270.png'], 
        specifications: { cores: '24-Cores', speed: '6.0 GHz Turbo' }, 
        description: 'Rendimiento extremo para productividad y gaming pesado.' 
      },

      // MONITORES
      { 
        name: 'Samsung Odyssey Neo G9 49"', 
        sku: 'SAM-G9-NEO', 
        brand: 'Samsung', 
        basePrice: 6500000, 
        categories: ['Monitors'], 
        images: ['https://images.samsung.com/is/image/samsung/p6pim/co/ls49ag950nlxzxl/gallery/co-odyssey-neo-g9-g95na-ls49ag950nlxzxl-530612450?$720_576_PNG$'], 
        specifications: { size: '49 inch', panel: 'Mini-LED 240Hz', curve: '1000R' }, 
        description: 'Inmersión total con tecnología Quantum Mini-LED.' 
      },
      { 
        name: 'LG UltraGear 27" OLED QHD', 
        sku: 'LG-27-OLED', 
        brand: 'LG', 
        basePrice: 3800000, 
        categories: ['Monitors', 'Gaming'], 
        images: ['https://www.lg.com/us/images/monitors/md08003668/gallery/desktop-01.jpg'], 
        specifications: { hz: '240Hz', panel: 'OLED', response: '0.03ms' }, 
        description: 'Colores perfectos y velocidad instantánea para competencia pro.' 
      },

      // PERIFÉRICOS
      { 
        name: 'Logitech MX Master 3S', 
        sku: 'LOGI-MX3S', 
        brand: 'Logitech', 
        basePrice: 480000, 
        categories: ['Mice', 'Productividad'], 
        images: ['https://resource.logitech.com/w_800,c_lpad,ar_16:10,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png'], 
        specifications: { sensor: '8000 DPI', silent: 'Quiet Clicks' }, 
        description: 'El ratón icónico remasterizado para una precisión máxima.' 
      },
      { 
        name: 'Razer BlackWidow V4 Pro', 
        sku: 'RZ-BW-V4', 
        brand: 'Razer', 
        basePrice: 1200000, 
        categories: ['Keyboards', 'Gaming'], 
        images: ['https://assets2.razerzone.com/images/pnx.assets/e24e2c3c6f6e804f35e72848981b29a6/razer-blackwidow-v4-pro-500x500.png'], 
        specifications: { switches: 'Razer Green Mechanical', lighting: 'Chroma RGB' }, 
        description: 'Control total con dial de mando y teclas macro dedicadas.' 
      },
      { 
        name: 'Sony WH-1000XM5', 
        sku: 'SONY-XM5', 
        brand: 'Sony', 
        basePrice: 1650000, 
        categories: ['Audio'], 
        images: ['https://www.sony.co/image/5d02da5df5528cc6cc3f055c4858771e?fmt=pjpg&wid=1200&hei=470&bgcolor=F1F5F9&qlt=43'], 
        specifications: { battery: '30h', anc: 'Industry Leading' }, 
        description: 'La mejor cancelación de ruido del mundo con un sonido excepcional.' 
      },

      // ALMACENAMIENTO
      { 
        name: 'Samsung 990 Pro 2TB NVMe', 
        sku: 'SAM-990-2TB', 
        brand: 'Samsung', 
        basePrice: 850000, 
        categories: ['Storage', 'Componentes'], 
        images: ['https://images.samsung.com/is/image/samsung/p6pim/co/mz-v9p2t0bw/gallery/co-990-pro-nvme-m2-ssd-mz-v9p2t0bw-534444538?$720_576_PNG$'], 
        specifications: { speed: '7450 MB/s Read', gen: 'PCIe 4.0' }, 
        description: 'El SSD definitivo para gamers y profesionales.' 
      }
    ];

    await this.productsService.runSeed(productsSeed as any);
    return { 
      message: 'Seed exitoso: Catálogo actualizado con 13 productos reales, fotos HD y precios en COP',
      count: productsSeed.length 
    };
  }
}
