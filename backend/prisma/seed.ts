import {PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main(){

    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();

    const adminPassword = await bcrypt.hash('Admin@1nv', 10);
    const staffPassword = await bcrypt.hash('Staff@1nv', 10);

    const admin = await prisma.user.upsert({

        where: { email: 'admin@inventory.com' },
        update:{},
        create: {
            email:'admin@inventory.com',
            password:adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },


        });

        const staff = await prisma.user.upsert({

            where:{email: 'staff@inventory.com'},
            update:{},
            create:{
                email:'staff@inventory.com',
                password: staffPassword,
                name: 'Staff User',
                role: 'STAFF',
                

            },

    });


console.log('User created :2 records');


const electronics = await prisma.category.upsert({
    where: {name: 'Electronics' },
    update: {},
    create: {name: 'Electronics' , description: 'Electronics devices and components'},
});

const furniture = await prisma.category.upsert({
    where : {name: 'Furniture'},
    update: {},
    create:{name: 'Furniture' , description: 'Office and home furniture'},
});

const stationery = await prisma.category.upsert({
    where : {name: 'Stationery'},
    update: {},
    create:{name: 'Stationery' , description: 'Writing materials and Office supplies'},
});

const clothing = await prisma.category.upsert({
    where:{ name :'Clothing'},
    update:{},
    create:{name : 'Clothing' , description:'Apparel and accessories'},
});

const tools = await prisma.category.upsert({
    where:{name:'Tools'},
    update:{},
    create:{name: 'Tools' , description:'Hardware and tools'},
});


const techDistributor = await prisma.supplier.upsert({
    where:{name: 'Tech Distributors Inc.'},
    update:{},
    create:{
        name: 'Tech Distributors Inc.',
        contactPerson: 'TUMUKUNDE Claver',
        phone: ' 0785930465',
        email: 'claver@techdist.com',
        address: '224 Tech Street, Kamonyi Plaza, 445K',
    },
});


const officeSupplies= await prisma.supplier.upsert({
    where:{name:'Office Supplies Co.'},
    update:{},
    create:{
        name: 'Office Supplies Co.',
        contactPerson:'IRADUKUNDA Yvette',
        phone:'0791891139',
        email: 'yvette@officesupplies.com',
        address:'456 KALISIMBI, MUSANZE, P2243',
    },
});

const furnitureWorld = await prisma.supplier.upsert({

    where:{name:'Furniture World'},
    update:{},
    create:{
        name:'Furniture World',
        contactPerson:'TUMAINI Chrispin',
        phone:'0724967557',
        email:'tumaini@furnitureworld.com',
        address:'12Z RUBAVU ,PG 203',
    },
});


console.log('Created 3 suppliers');



//electronics

const mouse = await prisma.product.upsert({

    where:{SKU : 'ELEC-001' },
    update:{},
    create:{
        SKU:'ELEC-001',
        name:'Wireless Mouse',
        description:'Ergonimic Wireless mouse with 2.4GHz connection',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:15.99,
        sellingPrice:25.99,
        minimumStock:10,
        currentStock:50,
        status: 'ACTIVE',
    },
});

const keyboard = await prisma.product.upsert({
    where :{SKU: 'ELEC-002'},
    update:{},
    create:{
        SKU:'ELEC-002',
        name:'Mechanical Keyboard',
        description:'RGB mechanical keyboard with blue switches',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:45.99,
        sellingPrice:79.99,
        minimumStock:5,
        currentStock:30,
        status:'ACTIVE',
    },
});

const monitor = await prisma.product.upsert({
    where :{SKU: 'ELEC-003'},
    update:{},
    create:{
        SKU:'ELEC-003',
        name:'24" Monitor',
        description:'Full HD 1080p LED monitor with HDMI',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:89.99,
        sellingPrice:149.99,
        minimumStock:5,
        currentStock:15,
        status:'ACTIVE',
    },
});



const usbHub = await prisma.product.upsert({
    where :{SKU: 'ELEC-004'},
    update:{},
    create:{
        SKU:'ELEC-004',
        name:'USB-C Hub',
        description:'7-in-1 USB hub with HDMI',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:25.99,
        sellingPrice:45.99,
        minimumStock:10,
        currentStock:3,
        status:'ACTIVE',
    },
});


const webCam = await prisma.product.upsert({
    where :{SKU: 'ELEC-005'},
    update:{},
    create:{
        SKU:'ELEC-005',
        name:'WebCam HD',
        description:'1080p HD Webcam with microphone',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:35.99,
        sellingPrice:59.99,
        minimumStock:5,
        currentStock:0,
        status:'ACTIVE',
    },
});


const laptopStand = await prisma.product.upsert({
    where :{SKU: 'ELEC-006'},
    update:{},
    create:{
        SKU:'ELEC-006',
        name:'Laptop Stand ',
        description:'Adjustable aliminum stand',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:29.99,
        sellingPrice:49.99,
        minimumStock:8,
        currentStock:20,
        status:'ACTIVE',
    },
});


const headphones = await prisma.product.upsert({
    where :{SKU: 'ELEC-007'},
    update:{},
    create:{
        SKU:'ELEC-007',
        name:'Noise cancelling Headphones',
        description:'Wireless over-ear headphones',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:59.99,
        sellingPrice:99.99,
        minimumStock:5,
        currentStock:12,
        status:'ACTIVE',
    },
});


const ssd = await prisma.product.upsert({
    where :{SKU: 'ELEC-008'},
    update:{},
    create:{
        SKU:'ELEC-008',
        name:'1TB SSD',
        description:'External solid state USB 3.0',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:79.99,
        sellingPrice:129.99,
        minimumStock: 10,
        currentStock:8,
        status:'ACTIVE',
    },
});




const tablet = await prisma.product.upsert({
    where :{SKU: 'ELEC-009'},
    update:{},
    create:{
        SKU:'ELEC-009',
        name:'10" Tablet',
        description:'Android tablet with 512 storage',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:149.99,
        sellingPrice:249.99,
        minimumStock: 5,
        currentStock:10,
        status:'ACTIVE',
    },
});





const powerBank = await prisma.product.upsert({
    where :{SKU: 'ELEC-010'},
    update:{},
    create:{
        SKU:'ELEC-010',
        name:'20000mAh Power Bank',
        description:'Fast charging portable charger',
        categoryId:electronics.id,
        supplierId:techDistributor.id,
        unitPrice:29.99,
        sellingPrice:49.99,
        minimumStock: 15,
        currentStock:25,
        status:'ACTIVE',
    },
});



//furnityure
const officechair = await prisma.product.upsert({
    where :{SKU: 'FURN-001'},
    update:{},
    create:{
        SKU:'FURN-001',
        name:'Office Chair',
        description:'Ergonomic mesh office cahir with lumbar support',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:89.99,
        sellingPrice:149.99,
        minimumStock:3,
        currentStock:15,
        status:'ACTIVE',
    },
});



const standingDesk = await prisma.product.upsert({
    where :{SKU: 'FURN-002'},
    update:{},
    create:{
        SKU:'FURN-002',
        name:'Standing Desk',
        description:'Electric height adjustable standing desk',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:199.99,
        sellingPrice:349.99,
        minimumStock:4,
        currentStock:10,
        status:'ACTIVE',
    },
});



const bookShelf = await prisma.product.upsert({
    where :{SKU: 'FURN-003'},
    update:{},
    create:{
        SKU:'FURN-003',
        name:'Bookshelf',
        description:'5-tier wood bookshelf',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:79.99,
        sellingPrice:129.99,
        minimumStock:4,
        currentStock:10,
        status:'ACTIVE',
    },
});


const  filingCabinet= await prisma.product.upsert({
    where :{SKU: 'FURN-004'},
    update:{},
    create:{
        SKU:'FURN-004',
        name:'Filing Cabinet',
        description:'4-drawer vertical filing cabinet',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:129.99,
        sellingPrice:199.99,
        minimumStock:4,
        currentStock:8,
        status:'ACTIVE',
    },
});


const  conferenceTable= await prisma.product.upsert({
    where :{SKU: 'FURN-005'},
    update:{},
    create:{
        SKU:'FURN-005',
        name:'Conference Table',
        description:'Rectangular conference table seats 6',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:229.99,
        sellingPrice:499.99,
        minimumStock:2,
        currentStock:8,
        status:'ACTIVE',
    },
});



const  deskLamp= await prisma.product.upsert({
    where :{SKU: 'FURN-006'},
    update:{},
    create:{
        SKU:'FURN-006',
        name:'LED Desk Lamp',
        description:'Adjustable brightness desk lamp',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:24.99,
        sellingPrice:99.99,
        minimumStock:5,
        currentStock:12,
        status:'ACTIVE',
    },
});


const  officeStool= await prisma.product.upsert({
    where :{SKU: 'FURN-007'},
    update:{},
    create:{
        SKU:'FURN-007',
        name:'Office Stool',
        description:'Height adjustable swivel stool',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:59.99,
        sellingPrice:99.99,
        minimumStock:5,
        currentStock:12,
        status:'ACTIVE',
    },
});



const  coffeeTable= await prisma.product.upsert({
    where :{SKU: 'FURN-008'},
    update:{},
    create:{
        SKU:'FURN-008',
        name:'Coffee Table',
        description:'Wooden coffee table for lounge',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:89.99,
        sellingPrice:149.99,
        minimumStock:3,
        currentStock:7,
        status:'ACTIVE',
    },
});


const  wardrobe= await prisma.product.upsert({
    where :{SKU: 'FURN-009'},
    update:{},
    create:{
        SKU:'FURN-009',
        name:'Wardrobe',
        description:'2-door wooden wardrobe',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:189.99,
        sellingPrice:299.99,
        minimumStock:2,
        currentStock:5,
        status:'ACTIVE',
    },
});



const  shoeRack = await prisma.product.upsert({
    where :{SKU: 'FURN-010'},
    update:{},
    create:{
        SKU:'FURN-010',
        name:'Shoe Rack',
        description:'3-tier shoe rack holder',
        categoryId:furniture.id,
        supplierId:furnitureWorld.id,
        unitPrice:29.99,
        sellingPrice:49.99,
        minimumStock:10,
        currentStock:18,
        status:'ACTIVE',
    },
});
//stationery

const paper =  await prisma.product.upsert({
    where:{SKU:'STAT-001'},
    update:{},
    create:{
        SKU:'STAT-001',
        name:'A4 Paper (500SHEETS)',
        description:'Premium 80gsm printer paper',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:3.99,
        sellingPrice:5.99,
        minimumStock:50,
        currentStock:200,
        status:'ACTIVE',

    },
});


const pens =  await prisma.product.upsert({
    where:{SKU:'STAT-002'},
    update:{},
    create:{
        SKU:'STAT-002',
        name:'Ballpoint Pens (12 pack)',
        description:'Blue ink ballpoint pens',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:2.49,
        sellingPrice:4.99,
        minimumStock:100,
        currentStock:500,
        status:'ACTIVE',

    },
});


const stickyNotes =  await prisma.product.upsert({
    where:{SKU:'STAT-003'},
    update:{},
    create:{
        SKU:'STAT-003',
        name:'Sticky Notes(4 packs)',
        description:'3x3 inches assorted colors',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:1.99,
        sellingPrice:3.99,
        minimumStock:50,
        currentStock:150,
        status:'ACTIVE',

    },
});


const folders =  await prisma.product.upsert({
    where:{SKU:'STAT-004'},
    update:{},
    create:{
        SKU:'STAT-004',
        name:'File flders (25 packs)',
        description:'Letter size assorted colrs',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:5.99,
        sellingPrice:9.99,
        minimumStock:30,
        currentStock:75,
        status:'ACTIVE',

    },
});



const notebooks =  await prisma.product.upsert({
    where:{SKU:'STAT-005'},
    update:{},
    create:{
        SKU:'STAT-005',
        name:'Notebook (5 packs)',
        description:'A5 spiral notebooks, 100 pages each',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:4.99,
        sellingPrice:8.99,
        minimumStock:40,
        currentStock:100,
        status:'ACTIVE',

    },
});



const markers =  await prisma.product.upsert({
    where:{SKU:'STAT-006'},
    update:{},
    create:{
        SKU:'STAT-006',
        name:'Whiteboard Markers (4 packs)',
        description:'Dry erase markers, assorted colrs',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:2.99,
        sellingPrice:5.99,
        minimumStock:30,
        currentStock:80,
        status:'ACTIVE',

    },
});


const envelops =  await prisma.product.upsert({
    where:{SKU:'STAT-007'},
    update:{},
    create:{
        SKU:'STAT-007',
        name:'Enveelopes (50 packs)',
        description:'A4 size envelopes, self-seal',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:3.99,
        sellingPrice:7.99,
        minimumStock:25,
        currentStock:60,
        status:'ACTIVE',

    },
});


const binderClips =  await prisma.product.upsert({
    where:{SKU:'STAT-008'},
    update:{},
    create:{
        SKU:'STAT-008',
        name:'Binder Clips (25 packs)',
        description:'Assorted sizes binder clips',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:1.99,
        sellingPrice:3.99,
        minimumStock:50,
        currentStock:120,
        status:'ACTIVE',

    },
});



const highlighters =  await prisma.product.upsert({
    where:{SKU:'STAT-009'},
    update:{},
    create:{
        SKU:'STAT-009',
        name:'Highlighters (6 packs)',
        description:'Fluorescent highlighters, assorted colors',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:2.49,
        sellingPrice:4.99,
        minimumStock:35,
        currentStock:90,
        status:'ACTIVE',

    },
});



const paperClips =  await prisma.product.upsert({
    where:{SKU:'STAT-010'},
    update:{},
    create:{
        SKU:'STAT-010',
        name:'Paper Clips (100 packs)',
        description:'Standard steel paper clips',
        categoryId:stationery.id,
        supplierId:officeSupplies.id,
        unitPrice:0.99,
        sellingPrice:1.99,
        minimumStock:100,
        currentStock:300,
        status:'ACTIVE',

    },
});



//ctlothes

const tshirt = await prisma.product.upsert({
    where:{SKU : 'CLOTH-001'},
    update:{},
    create:{
        SKU:'CLOTH-001',
        name:'Uniform T-shirt',
        description:'Cotton blend t-shirt',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:9.99,
        sellingPrice:19.99,
        minimumStock:20,
        currentStock:50,
        status: 'ACTIVE',
    },
});



const jacket = await prisma.product.upsert({
    where:{SKU : 'CLOTH-002'},
    update:{},
    create:{
        SKU:'CLOTH-002',
        name:'Winter Jacket',
        description:'Waterproof winter jacket',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:49.99,
        sellingPrice:89.99,
        minimumStock:10,
        currentStock:25,
        status: 'ACTIVE',
    },
});




const poloShirt = await prisma.product.upsert({
    where:{SKU : 'CLOTH-003'},
    update:{},
    create:{
        SKU:'CLOTH-003',
        name:'Polo Shirt',
        description:'Cotton polo with collar',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:14.99,
        sellingPrice:29.99,
        minimumStock:15,
        currentStock:40,
        status: 'ACTIVE',
    },
});




const jeans = await prisma.product.upsert({
    where:{SKU : 'CLOTH-004'},
    update:{},
    create:{
        SKU:'CLOTH-004',
        name:'Blue Jeans',
        description:'Classic fit denim jeans',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:29.99,
        sellingPrice:59.99,
        minimumStock:10,
        currentStock:30,
        status: 'ACTIVE',
    },
});




const hoodie = await prisma.product.upsert({
    where:{SKU : 'CLOTH-005'},
    update:{},
    create:{
        SKU:'CLOTH-005',
        name:'Hoodie',
        description:'Cotton hoodie with front pocket',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:24.99,
        sellingPrice:49.99,
        minimumStock:10,
        currentStock:25,
        status: 'ACTIVE',
    },
});



const cap = await prisma.product.upsert({
    where:{SKU : 'CLOTH-006'},
    update:{},
    create:{
        SKU:'CLOTH-006',
        name:'Baseball Cap',
        description:'Adjustable cotton cap',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:7.99,
        sellingPrice:15.99,
        minimumStock:20,
        currentStock:50,
        status: 'ACTIVE',
    },
});




const scarf = await prisma.product.upsert({
    where:{SKU : 'CLOTH-007'},
    update:{},
    create:{
        SKU:'CLOTH-007',
        name:'Winter Scarf',
        description:'Warm  knitted scarf',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:9.99,
        sellingPrice:19.99,
        minimumStock:15,
        currentStock:35,
        status: 'ACTIVE',
    },
});



const gloves = await prisma.product.upsert({
    where:{SKU : 'CLOTH-008'},
    update:{},
    create:{
        SKU:'CLOTH-008',
        name:'Winter Gloves',
        description:'Insulted thermal gloves',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:8.99,
        sellingPrice:17.99,
        minimumStock:15,
        currentStock:40,
        status: 'ACTIVE',
    },
});



const socks = await prisma.product.upsert({
    where:{SKU : 'CLOTH-009'},
    update:{},
    create:{
        SKU:'CLOTH-009',
        name:'Socks (6 packs)',
        description:'Cotton ankle socks',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:5.99,
        sellingPrice:11.99,
        minimumStock:30,
        currentStock:100,
        status: 'ACTIVE',
    },
});



const belt = await prisma.product.upsert({
    where:{SKU : 'CLOTH-010'},
    update:{},
    create:{
        SKU:'CLOTH-010',
        name:'Leather Belt',
        description:'Genuine leather belt',
        categoryId:clothing.id,
        supplierId:null,
        unitPrice:12.99,
        sellingPrice:24.99,
        minimumStock:10,
        currentStock:25,
        status: 'ACTIVE',
    },
});

//tools
const toolset = await prisma.product.upsert({
    where:{ SKU: 'TOOL-001'},
    update:{},
    create:{
        SKU:'TOOL-001',
        name:'Tool Set (50 pcs)',
        description:'50-piece household toolset',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:39.99,
        sellingPrice:69.99,
        minimumStock:5,
        currentStock:12,
        status:'ACTIVE',
    },
});



const hammer = await prisma.product.upsert({
    where:{ SKU: 'TOOL-002'},
    update:{},
    create:{
        SKU:'TOOL-002',
        name:'Claw Hammer',
        description:'16oz fiberglass handle hammer',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:8.99,
        sellingPrice:15.99,
        minimumStock:8,
        currentStock:20,
        status:'ACTIVE',
    },
});


const screwdriverSet = await prisma.product.upsert({
    where:{ SKU: 'TOOL-003'},
    update:{},
    create:{
        SKU:'TOOL-003',
        name:'Screwdriver Set (8 pcs)',
        description:'Flathead and  Phillipsset',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:19.99,
        sellingPrice:24.99,
        minimumStock:6,
        currentStock:15,
        status:'ACTIVE',
    },
});



const wrench = await prisma.product.upsert({
    where:{ SKU: 'TOOL-004'},
    update:{},
    create:{
        SKU:'TOOL-004',
        name:'Wrench Set (10 pcs)',
        description:'Metric combination wrench set',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:24.99,
        sellingPrice:49.99,
        minimumStock:5,
        currentStock:12,
        status:'ACTIVE',
    },
});


const pliers = await prisma.product.upsert({
    where:{ SKU: 'TOOL-005'},
    update:{},
    create:{
        SKU:'TOOL-005',
        name:'Pliers Set',
        description:'Combination, needle nose, slip joint',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:14.99,
        sellingPrice:29.99,
        minimumStock:6,
        currentStock:14,
        status:'ACTIVE',
    },
});



const tapemeasure = await prisma.product.upsert({
    where:{ SKU: 'TOOL-006'},
    update:{},
    create:{
        SKU:'TOOL-006',
        name:'Tape Measure',
        description:'25ft self-locking tape measure',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:7.99,
        sellingPrice:14.99,
        minimumStock:10,
        currentStock:25,
        status:'ACTIVE',
    },
});

const level = await prisma.product.upsert({
    where:{ SKU: 'TOOL-007'},
    update:{},
    create:{
        SKU:'TOOL-007',
        name:'Torpedo Level',
        description:'9-inch magnet level',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:9.99,
        sellingPrice:18.99,
        minimumStock:8,
        currentStock:18,
        status:'ACTIVE',
    },
}); 



const utilityKnife = await prisma.product.upsert({
    where:{ SKU: 'TOOL-008'},
    update:{},
    create:{
        SKU:'TOOL-008',
        name:'Utility Knife',
        description:'Rectangle snap-off blade knife',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:4.99,
        sellingPrice:9.99,
        minimumStock:12,
        currentStock:30,
        status:'ACTIVE',
    },
});


const drillBits = await prisma.product.upsert({
    where:{ SKU: 'TOOL-009'},
    update:{},
    create:{
        SKU:'TOOL-009',
        name:'Drill Bit Set(21 pcs)',
        description:'High-speed steel drill bits',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:15.99,
        sellingPrice:29.99,
        minimumStock:5,
        currentStock:10,
        status:'ACTIVE',
    },
});


const toolbag = await prisma.product.upsert({
    where:{ SKU: 'TOOL-010'},
    update:{},
    create:{
        SKU:'TOOL-010',
        name:'Tool Bag',
        description:'Heavy-duty canvas household tool bag',
        categoryId:tools.id,
        supplierId:null,
        unitPrice:19.99,
        sellingPrice:39.99,
        minimumStock:5,
        currentStock:8,
        status:'ACTIVE',
    },
});

console.log('Products created :50 records');


//creation of stock movement



await prisma.stockMovement.create({
    data:{
        productId:mouse.id,
        movementType:'STOCK_IN',
        quantity:50,
        previousStock:0,
        newStock:50,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});




await prisma.stockMovement.create({
    data:{
        productId:keyboard.id,
        movementType:'STOCK_IN',
        quantity:30,
        previousStock:0,
        newStock:30,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});




await prisma.stockMovement.create({
    data:{
        productId:monitor.id,
        movementType:'STOCK_IN',
        quantity:15,
        previousStock:0,
        newStock:15,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});






await prisma.stockMovement.create({
    data:{
        productId:usbHub.id,
        movementType:'STOCK_IN',
        quantity:20,
        previousStock:0,
        newStock:20,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});




await prisma.stockMovement.create({
    data:{
        productId:officechair.id,
        movementType:'STOCK_IN',
        quantity:15,
        previousStock:0,
        newStock:15,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});




await prisma.stockMovement.create({
    data:{
        productId:standingDesk.id,
        movementType:'STOCK_IN',
        quantity:8,
        previousStock:0,
        newStock:8,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});






await prisma.stockMovement.create({
    data:{
        productId:paper.id,
        movementType:'STOCK_IN',
        quantity:200,
        previousStock:0,
        newStock:200,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});



await prisma.stockMovement.create({
    data:{
        productId:pens.id,
        movementType:'STOCK_IN',
        quantity:500,
        previousStock:0,
        newStock:500,
        reason: 'Initial inventory',
        userId:admin.id,
    },
});




await prisma.stockMovement.create({
    data:{
        productId:mouse.id,
        movementType:'STOCK_OUT',
        quantity:5,
        previousStock:50,
        newStock:45,
        reason: 'Customer purchase',
        reference:'ORDER-002',
        userId:staff.id,
    },
});




await prisma.stockMovement.create({
    data:{
        productId:keyboard.id,
        movementType:'STOCK_OUT',
        quantity:2,
        previousStock:30,
        newStock:28,
        reason: 'Customer purchase',
        reference: 'ORDER-002',
        userId:staff.id,
    },
});


await prisma.stockMovement.create({
    data:{
        productId:poloShirt.id,
        movementType:'STOCK_IN',
        quantity:40,
        previousStock:0,
        newStock:40,
        reason:'Initial inventory',
        userId: admin.id,
    },
});



console.log('Stock movements created: 11 records');
console.log('Seeding completed...');
console.log('Default Login credential..');
console.log('Admin - Email: admin@inventory.com | Password:Admin@1nv');
console.log('Staff - Email: staff@inventory.com | Password:Staff@1nv');

}


main()
.catch((e)=>{
        console.error('Seed failed',e);
        (process as any).exit(1);

})
.finally(async ()=>{
    await prisma.$disconnect();
});













































