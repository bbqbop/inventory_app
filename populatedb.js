#! /usr/bin/env node
require('dotenv').config();

const Category = require('./models/category');
const Dino = require('./models/dino');
const LifePeriod = require('./models/lifeperiod')

const categories = [];
const lifePeriods = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongoDB = process.env.MONGODB_URI;

main().catch(err => {
    console.log(err)
});

async function main() {
    await mongoose.connect(mongoDB);
    await clearCollection();
    await createCategories();
    await createLifePeriods();
    await createDinos();
    await mongoose.connection.close();
};

async function clearCollection() {
    // Clear collection by deleting all documents
    await Category.deleteMany({});
    await Dino.deleteMany({});
    await LifePeriod.deleteMany({});
}

async function categoriesCreate(index, name, desc) {
    const category = new Category( { name, desc } );
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
}

async function lifePeriodsCreate(index, name, span, desc) {
    const lifePeriod = new LifePeriod( { index, name, span, desc });
    await lifePeriod.save();
    lifePeriods[index] = lifePeriod;
    console.log(`Life Period added: ${name}`);
}

async function dinoCreate(index, name, desc, lifePeriod, categories){
    const dino = new Dino( { name, desc, lifePeriod, categories } );
    await dino.save();
    console.log(`Added Dino: ${name}`);
}

async function createCategories(){
    await Promise.all([
        categoriesCreate(0, 'Sauropods', 'Sauropods were long-necked, herbivorous dinosaurs known for their massive size and elongated necks.'),
        categoriesCreate(1, 'Theropods', 'Theropods were bipedal, carnivorous dinosaurs with sharp teeth and claws.'),
        categoriesCreate(2, 'Ornithopods', 'Ornithopods were herbivorous dinosaurs characterized by their bird-like hips and teeth.'),
        categoriesCreate(3, 'Ceratopsians', 'Ceratopsians were herbivorous dinosaurs with beaks and elaborate frills and horns.'),
        categoriesCreate(4, 'Ankylosaurs', 'Ankylosaurs were heavily armored, herbivorous dinosaurs with bony plates and spikes.'),
        categoriesCreate(5, 'Thyreophorans', 'Thyreophorans were armored, herbivorous dinosaurs with various types of body armor.'),
        categoriesCreate(6, 'Carnivorous Dinosaurs', 'Carnivorous dinosaurs were bipedal predators with sharp teeth and claws.'),
        categoriesCreate(7, 'Herbivorous Dinosaurs', 'Herbivorous dinosaurs were plant-eating dinosaurs with specialized teeth for grinding vegetation.'),
    ]);
};

async function createLifePeriods(){
    await Promise.all([
        lifePeriodsCreate(0, 'Triassic', '(~251 to 201 million years ago)', 'The Triassic period saw the emergence of the first dinosaurs and the evolution of various reptile groups.'),
        lifePeriodsCreate(1, 'Jurassic', '(~201 to 145 million years ago)', 'The Jurassic period was characterized by the dominance of dinosaurs like sauropods and theropods.'),
        lifePeriodsCreate(2, 'Cretaceous', '(~145 to 66 million years ago)', 'The Cretaceous period marked the rise of diverse dinosaurs, including large herbivores and carnivores.')
        // Add more life periods as needed...
    ]);
}

async function createDinos(){
    await Promise.all([
        // Sauropods
        dinoCreate(0, 'Apatosaurus', 'A massive, long-necked herbivore known for its long tail and small head.', lifePeriods[1], [categories[0], categories[7]]),
        dinoCreate(1, 'Brachiosaurus', 'A tall, long-necked sauropod with longer front legs than hind legs.', lifePeriods[1], [categories[0]]),
        dinoCreate(2, 'Diplodocus', 'A long-necked, whip-tailed dinosaur with a slender body.', lifePeriods[1], [categories[0]]),
        dinoCreate(3, 'Argentinosaurus', 'One of the largest known dinosaurs, Argentinosaurus was a massive herbivore with a long neck and tail.', lifePeriods[2], [categories[0]]),
        dinoCreate(4, 'Titanosaurus', 'A diverse group of sauropod dinosaurs known for their large size and long necks.', lifePeriods[2], [categories[0]]),

        // Theropods
        dinoCreate(5, 'Tyrannosaurus Rex', 'One of the largest carnivorous dinosaurs, Tyrannosaurus Rex had powerful jaws, sharp teeth, and tiny forelimbs.', lifePeriods[2], [categories[1], categories[6]]),
        dinoCreate(6, 'Velociraptor', 'A small, agile carnivore with a sickle-shaped claw on each foot.', lifePeriods[2], [categories[1], categories[6]]),
        dinoCreate(7, 'Allosaurus', 'A large theropod dinosaur with a massive skull and sharp teeth.', lifePeriods[1], [categories[1], categories[6]]),
        dinoCreate(8, 'Spinosaurus', 'A massive theropod dinosaur with a sail-like structure on its back.', lifePeriods[2], [categories[1], categories[6]]),
        dinoCreate(9, 'Carnotaurus', 'A theropod dinosaur characterized by its distinctive horns above the eyes.', lifePeriods[2], [categories[1], categories[6]]),

        // Ornithopods
        dinoCreate(10, 'Triceratops', 'A large herbivorous dinosaur with a frill and three facial horns.', lifePeriods[2], [categories[2], categories[7]]),
        dinoCreate(11, 'Stegosaurus', 'A herbivorous dinosaur known for its double row of large plates along its back and spikes on its tail.', lifePeriods[1], [categories[2], categories[7]]),
        dinoCreate(12, 'Parasaurolophus', 'A herbivorous dinosaur with a long, elaborate crest on its head.', lifePeriods[2], [categories[7], categories[1]]),
        dinoCreate(13, 'Iguanodon', 'A large herbivorous dinosaur with a thumb spike that it may have used for defense or foraging.', lifePeriods[2], [categories[7], categories[1]]),
        dinoCreate(14, 'Hadrosaurus', 'A duck-billed dinosaur with hundreds of tightly packed teeth used for grinding plant material.', lifePeriods[2], [categories[7], categories[1]]),

        // Ceratopsians
        dinoCreate(15, 'Styracosaurus', 'A ceratopsian dinosaur with a large nasal horn and several smaller horns on its frill.', lifePeriods[2], [categories[7], categories[2]]),
        dinoCreate(16, 'Protoceratops', 'A small, horned dinosaur with a parrot-like beak.', lifePeriods[2], [categories[7], categories[2]]),
        dinoCreate(17, 'Centrosaurus', 'A ceratopsian dinosaur with a nasal horn and elaborate frill adorned with small horns.', lifePeriods[2], [categories[7], categories[2]]),
        dinoCreate(18, 'Pachyrhinosaurus', 'A thick-skulled ceratopsian dinosaur with bosses and spikes on its skull.', lifePeriods[2], [categories[7], categories[2]]),

        // Ankylosaurs
        dinoCreate(19, 'Euoplocephalus', 'Another heavily armored ankylosaurid dinosaur known for its thick bony armor and tail club.', lifePeriods[2], [categories[7], categories[3]]),
        dinoCreate(20, 'Nodosaurus', 'A nodosaurid ankylosaurid dinosaur with a heavily armored body but lacking a tail club.', lifePeriods[2], [categories[7], categories[3]]),
        dinoCreate(21, 'Panoplosaurus', 'A nodosaurid ankylosaurid dinosaur with extensive bony armor covering its body.', lifePeriods[2], [categories[7], categories[3]]),
        dinoCreate(22, 'Gastonia', 'An early nodosaurid dinosaur known for its extensive armor and spikes along its body.', lifePeriods[2], [categories[7], categories[3]]),

        // Thyreophorans
        dinoCreate(23, 'Kentrosaurus', 'A stegosaurid dinosaur with long spikes running along its back and tail.', lifePeriods[1], [categories[7], categories[4]]),
        dinoCreate(24, 'Tuojiangosaurus', 'A stegosaurid dinosaur known for its spikes and plates covering its body.', lifePeriods[1], [categories[7], categories[4]]),
        dinoCreate(25, 'Edmontonia', 'A heavily armored nodosaurid dinosaur with large spikes covering its body.', lifePeriods[2], [categories[7], categories[4]]),
        dinoCreate(26, 'Nodosaurus', 'A nodosaurid dinosaur with bony plates and spikes covering its body.', lifePeriods[2], [categories[7], categories[4]]),

        // Carnivorous Dinosaurs (contd.)
        dinoCreate(27, 'Tyrannosaurus Rex', 'One of the largest carnivorous dinosaurs, Tyrannosaurus Rex had powerful jaws, sharp teeth, and tiny forelimbs.', lifePeriods[1], [categories[6], categories[5]]),
        dinoCreate(28, 'Velociraptor', 'A small, agile carnivore with a sickle-shaped claw on each foot.', lifePeriods[2], [categories[6], categories[5]]),
        dinoCreate(29, 'Allosaurus', 'A large theropod dinosaur with a massive skull and sharp teeth.', lifePeriods[2], [categories[6], categories[5]]),
        dinoCreate(30, 'Spinosaurus', 'A massive theropod dinosaur with a sail-like structure on its back.', lifePeriods[2], [categories[6], categories[5]]),
        dinoCreate(31, 'Carnotaurus', 'A theropod dinosaur characterized by its distinctive horns above the eyes.', lifePeriods[2], [categories[6], categories[5]]),

        // Herbivorous Dinosaurs (contd.)
        dinoCreate(32, 'Triceratops', 'A large herbivorous dinosaur with a frill and three facial horns.', lifePeriods[2], [categories[7], categories[0]]),
        dinoCreate(33, 'Stegosaurus', 'A herbivorous dinosaur known for its double row of large plates along its back and spikes on its tail.', lifePeriods[2], [categories[7], categories[0]]),
        dinoCreate(34, 'Parasaurolophus', 'A herbivorous dinosaur with a long, elaborate crest on its head.', lifePeriods[2], [categories[7], categories[0]]),
        dinoCreate(35, 'Apatosaurus', 'A massive, long-necked herbivore known for its long tail and small head.', lifePeriods[2], [categories[7], categories[0]]),
        dinoCreate(36, 'Diplodocus', 'A long-necked, whip-tailed dinosaur with a slender body.', lifePeriods[2], [categories[7], categories[0]]),
        // Add more herbivorous dinosaurs here
    ]);
}




