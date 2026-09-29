const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

    const customer = await prisma.customer.create({
        data: {
            name: "John",
            email: "john@gmail.com",
        },
    });

    console.log('Created customer: ', customer);

    const drink = await prisma.drink.create({
        data: {
            name: 'Oat Milk Latte',
            category: 'COFFEE',
            price: 4.75,
            stock: 10,
        },
    });
    console.log('Created drink: ', drink);

    const allDrinks = await prisma.drink.findMany();
    console.log("Full Menu: ", allDrinks);

    const oneCustomer = await prisma.customer.findUnique({
        where : {email: 'john@gmail.com'},
    });
    console.log("Found by in email: ", oneCustomer);

    const priceUpdate = await prisma.drink.update({
        where: {id : 1},
        data: { price: 6.75 },
    });
    console.log('Updated price: ', priceUpdate);

    const stockUpdate = await prisma.drink.update ({
        where: {id : 1},
        data: { stock: { decrement: 1} },
    });
    console.log('Stock decremented: ', stockUpdate);

    const deletedDrink = await prisma.drink.delete({
        where: {id : 1},
    });
    console.log('Removed from menu: ', deletedDrink)


    const order = await prisma.order.create({
        data: {
            customer: { connect: { email: 'john@gmail.com'} },
            items : {
                create: [
                    { drinkId : 2, quantity: 2},
                ],
            },
        },
        include : {
            items: { include: {drink : true } },

        },
    });
    console.log('New order: ', order);


    const customerHistory = await prisma.customer.findUnique({
        where: {
            id : 1

        },

        include: {
            orders: { include: {items: {include: {drink : true}}}},

        },
    });
    console.log('Customer order history: ', customerHistory);


}

main() 
    .catch((e)=> console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    })