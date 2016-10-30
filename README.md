## Introduction

**Endless Commerce** – First Open Source Ecommerce Platform based on Serverless Framework.

Endless helps merchant sell their products quickly, everywhere and at low cost. Focusing on their business and stop worrying about maintaining their platform.

## How to install

It's very easy, with only 2 steps you can start working on Endless platform :

* ##### First, install Serverless Framework via npm:
  * `npm install -g serverless`

* ##### Then, install Endless:
  * `serverless install -u https://github.com/endless-commerce/endless`

## How to deploy

* ##### Set-up your [AWS Provider Credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

* ##### Deploy Endless on AWS :
  * `serverless deploy -v`
  
There you go, you have your first eCommerce platform. Enjoy it !

You can also deploy only the frontend with this command : 
  * `serverless deploy frontend`

## Roadmap

What we would like to develop :

* ##### Release 0.1 :
  * Find a way to export Angular frontend to S3 -> **Done**
  * Load sample data
  * A product list page
  * A product page
  * Add to cart function
  * Show product in the cart
  
Check our [Wiki](https://github.com/endless-commerce/endless/wiki/Roadmap) to get more details about the entire roadmap.

## Questions and Ideas

If you have any questions or ideas, don't hesitate to send me an email at contact@endless-commerce.com or private message on [Endless Twitter](https://twitter.com/endless_commerc)