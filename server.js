const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Prisma } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/drinks', async (req, res) => {
    const { category } = req.query;

    const drinks = await prisma.drink.findMany({
        where: category ? { category: category.toUpperCase() } : undefined,
        orderBy: { price: 'asc' },
    });

    res.json(drinks);
});

app.post('/drinks', async (req, res) => {
    const { name, category, price, stock } = req.body;

    const drink = await prisma.drink.create({
        data: { name, category, price, stock },
    });

    res.status(201).json(drink);
});

app.post('/customers', async (req, res) => {
    const { name, email } = req.body;
    
    try {
    const customer = await prisma.customer.create({
      data: { name, email },
    });
    res.status(201).json(customer);
  } catch (error) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        
        return res.status(409).json({ error: 'That email is already registered.' });
      }
    }
   
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.get('/customers/:id/orders', async (req, res) => {
    const customer = await prisma.customer.findUnique({
        where: {
            id: Number(req.params.id),
        },

        include: {
            orders: {
                include: {
                    items: {
                        include: {
                            drink: true,
                        },
                    },
                },
            },
        },
    });
    
    if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

    res.json(customer);
});

app.get('/customers/:id/orders/page/:pageNumber', async (req, res) => {
    const pageSize = 5;
    const page = Number(req.params.pageNumber);

    const orders = await prisma.order.findMany({
        where: {
            customerId: Number(req.params.id),
        },

        skip: (page - 1) * pageSize,
        take: pageSize,

        orderBy: {
            createdAt: 'desc',
        },

        include: {
            items: {
                include: {
                    drink: true,
                },
            },
        },
    });

    res.json(orders);
});

app.post('/orders', async (req, res) => {
    const { customerId, items } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const drink = await tx.drink.findUnique({
                    where: {
                        id: item.drinkId,
                    },
                });

                if (!drink || drink.stock < item.quantity) {
                    throw new Error(
                        `Not enough stock for drink ${item.drinkId}`
                    );
                }

                await tx.drink.update({
                    where: {
                        id: item.drinkId,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            const order = await tx.order.create({
                data: {
                    customer: {
                        connect: {
                            id: customerId,
                        },
                    },
                    items: {
                        create: items,
                    },
                },

                include: {
                    items: {
                        include: {
                            drink: true,
                        },
                    },
                },
            });

            return order;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
});

app.listen(3000, () => {
    console.log('The Daily Grind API running on port 3000');
});