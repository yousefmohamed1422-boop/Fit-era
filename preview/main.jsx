import '@fontsource/anton';
import '@fontsource/poppins';
import '../resources/css/app.css';
import { createRoot } from 'react-dom/client';
import Storefront from '../resources/js/Storefront';

createRoot(document.getElementById('app')).render(<Storefront />);
