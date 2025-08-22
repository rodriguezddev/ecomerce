
import { 
  productServiceExtensions, 
  categoryServiceExtensions, 
  reportService, 
  invoiceService, 
  shippingCompanyService, 
  orderService, 
  paymentService,
  userServiceExtensions 
} from './api-dashboard';
import { productService, categoryService, userService } from './api';

// Extend the original API services with our new methods
Object.assign(productService, productServiceExtensions);
Object.assign(categoryService, categoryServiceExtensions);
Object.assign(userService, userServiceExtensions);

export { 
  reportService,
  invoiceService,
  shippingCompanyService,
  orderService,
  paymentService,
  userService
};
