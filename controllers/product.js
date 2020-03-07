const formidable = require('formidable');
const _ = require('lodash')
const fs = require('fs');
const Product = require('../models/product');

exports.productById = (req, res, next, id) => {
    Product.findById(id)
    .populate('category')
    .exec((error, product) => {
        if (error || !product) {
            return res.status(400).json({
                error: 'Produit non trouvé'
            })
        }
        req.product = product;
        next();
    });
};

exports.read = (req, res) => {
    req.product.image = undefined;
    return res.json(req.product);
}

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'L\'image ne peut pas être chargée'
            })
        }

        if (!fields.name || !fields.price || !fields.category || !fields.quantity) {
            return res.status(400).json({
                error: "Tous les champs doivent être remplis"
            })
        }

        console.log('fields', fields, 'files', files)
        let product = new Product(fields);
        console.log('product', product)
        if (files.image) {
            if (files.image.size > 1000000) {
                return res.status(400).json({
                    error: "La taille de l'image ne doit pas dépasser plus de 1mb"
                })
            }
            product.image.data = fs.readFileSync(files.image.path)
            product.image.contentType = files.image.type
        }
        product.save((error, result) => {
            if (error) {
                console.log('error', error);
                return res.status(400).json({
                    error
                });
            }
            console.log('result', result)
            res.json(result);
        })
    })
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'L\'image n\'a pas pu être chargée'
            })
        }

        let product = req.product
        product = _.extend(product, fields)

        if (files.image) {
            if (files.image.size > 1000000) {
                return res.status(400).json({
                    error: "La taille d'une image ne doit pas dépasser plus de 1mb"
                })
            }
            product.image.data = fs.readFileSync(files.image.path)
            product.image.contentType = files.image.type
        }
        product.save((error, result) => {
            if (error) {
                return res.status(400).json({
                    error
                });
            }
            res.json(result);
        })
    })
};

exports.remove = (req, res) => {
    let product = req.product
    product.remove((error, deletedProduct) => {
        if (error) {
            return res.status(400).json({
                error
            });
        }
        res.json({
            "message": 'Produit supprimé'
        })
    })
}

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find().select("-image").populate('category').sort([[sortBy, order]]).limit(limit).exec(
        (error, products) => {
            if (error) {
                return res.status(400).json({
                    error: 'Produit non trouvé'
                })
            }
            res.json(products);
        }
    )
}

exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (error, categories) => {
        if (error) {
            return res.status(400).json({
                error: 'Catégorie non trouvée'
            })
        }
        res.json(categories);
    })
}

exports.image = (req, res, next) => {
    if (req.product.image.data) {
        res.set('Content-Type', req.product.image.contentType)
        return res.send(req.product.image.data);
    }
    next();
}

exports.listSearch = (req, res) => {
    const query = {}
    console.log('req', req.query)
    if (req.query.search) {
        query.name = {$regex: req.query.search, $options: 'i'}
        if (req.query.category && req.query.category != 'All') {
            query.categories = req.query.category
        }

        Product.find(query, (error, products) => {
            if (error) {
                return res.status(400).json({
                    error
                })
            }
            res.json(products)
        }).select('-image')
    }
}
