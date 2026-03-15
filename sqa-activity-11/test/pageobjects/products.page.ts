import { $ } from '@wdio/globals';

class ProductsPage {
  get productsTitle() {
    return $('~Products');
  }

  get cartBadge() {
    return $('id=com.saucelabs.mydemoapp.rn:id/cartIV');
  }

  get backpackAddToCartButton() {
    return $('~Add To Cart button');
  }

  get cartButton() {
    return $('~cart badge');
  }

  get checkoutButton() {
    return $('~Confirms products for checkout');
  }

  async addFirstProductToCart(): Promise<void> {
    await this.backpackAddToCartButton.waitForDisplayed({ timeout: 10000 });
    await this.backpackAddToCartButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartButton.waitForDisplayed({ timeout: 10000 });
    await this.cartButton.click();
  }
}

export default new ProductsPage();
