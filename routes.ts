import { index, route } from "@react-router/dev/routes";

export default [ 
    index('routes/home.jsx'),

    //Authentication Routes
    route('/auth/signup', 'routes/auth/signup.jsx'),
    route('/auth/signin', 'routes/auth/signin.jsx'),

    // Common Routes
    route('/menu', 'routes/menu.jsx'),
    route('/about','routes/about.jsx'),
    route('/contact','routes/contact.jsx'),

    // User Routes
    route('/user/my-orders', 'routes/user/my-orders.jsx'),
    route('/user/favourites', 'routes/user/favourites.jsx'),
    route('user/settings', 'routes/user/settings.jsx'),

    // Admin Routes
    route('/admin/dashboard', 'routes/admin/dashboard.jsx'),
    route('/admin/add-menu', 'routes/admin/add-menu.jsx'),
    route('/admin/orders', 'routes/admin/order-list.jsx'),
    route('/admin/reviews', 'routes/admin/reviews.jsx')
];
