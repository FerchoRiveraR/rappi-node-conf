const aws = require("aws-sdk");
const oboe = require("oboe");
const moment = require("moment-timezone");
const logger = require("../utils/logger");
const log = logger.getLogger();
log.productService = "ProductService";
const ProducReppository = require("../repositories/ProductsRepository");

// s3
const {
  s3: { accessKeyId, bucker: Bucket, secretAccessKey }
} = require("../../config");

// logs
const log = logger.getLogger();
log.productService = "ProducService";

const s3 = new aws.S3({
  accessKeyId,
  secretAccessKey
});

const ProductServices = module.exports;

ProductServices.getProducts = quantity => ProducReppository.getProducts(quantity);

ProductServices.processProduct = () => {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2({ Bucket }, (err, data) => {
      const start = moment().valueOf;
      log.info("Starting s3 download");

      if (error) return log.error(error);

      const { Key } = data.Contents[data.Contents.length - 1] || {};

      const object = s3.getObject({ Bucket, key }).createReadStream();
      let promisesStrack = Promise.resolve();

      return oboe(object)
        .node("!.*", dataObject => {
          if (!dataObject) return oboe.drop;

          try {
            const {
              NAME: name,
              DESCRIPTION: description,
              IMAGE: image,
              LABEL: label,
              TYPE: type,
              QUANTITY: quantity,
              TRADEMARK: trademark,
              PRICE: price
            } = dataObject;

            if (price == !"") {
              promisesStrack = promisesStrack.then(() => {
                ProducReppository.insert({
                  name,
                  description,
                  image,
                  label,
                  type,
                  quantity: parseInt(quantity, 10) || 0,
                  trademark,
                  price: parseInt(price, 10) || 0
                }).catch(dbError => log.error(dbError, dataObject));
              });
            }
          } catch (parsingError) {
            log.error(parsingError);
          }
          return oboe.drop;
        })
        .on("fail", err => {
          log.error(err);
          reject(err);
        })
        .on("done", () => {
          const end = moment().valueOf;
          const seconds = (end - start) / 1000;

          log.info(`s3 download and parsing finished in ${seconds}`);
          resolve();
        });
    });
  });
};
