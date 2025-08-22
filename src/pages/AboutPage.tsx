import Header from '@/components/Header';
import React from 'react';

const AboutPage = () => {
  return (
    <div>
            <Header />
            <main className="container mx-auto px-4 py-8">
            <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Nuestra Historia
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6 text-justify">
            <p>
              En julio de 2022, la empresa Repuestos y Accesorios M&C7, C. A., dio inicio a sus actividades comerciales. El negocio, nace de la idea de ofrecer al sector de Naguanagua, en el estado Carabobo, un establecimiento de venta de repuestos automotrices exclusivo para los modelos de la marca Chery. Las razones para crear este negocio fueron muy variadas, pero entre las más importantes destaca que en el sector, no existía una empresa con esta iniciativa y, sumado a esto, se había observado, que una parte considerable de la población posee vehículos de esta marca, por ende, la demanda es alta.
            </p>
            <p>
              En marzo de 2023, aprovechando el auge de las redes sociales, se crea la cuenta en Instagram, @repuestosmc7, donde se realizan publicaciones de los repuestos que ofrece, promociones, e información de interés, lo que permitió que el negocio tuviera un mayor alcance. Al aumentar la cantidad de personas interesadas en los productos, y el crecimiento rápido del número de clientes, la empresa decide ofrecer a sus clientes la facilidad de delivery en la ciudad. Igualmente, esta idea propició, que se dispusiera la opción de envíos a nivel nacional a través de diversas empresas de encomienda.
            </p>
            <p>
              Desde su creación, la empresa Repuestos y Accesorios M&C7, C.A. ha mantenido como objetivo, ampliar sus volúmenes de ventas haciendo uso de herramientas tecnológicas que sirvan como medio para lograrlo, de modo que aumente su productividad, eficiencia y satisfacción del cliente. Es por esto que este año, pone a disposición de sus clientes el sitio web de la empresa, que le permita ampliar su alcance en el mercado, además de proporcionar una mejora en cuanto a al servicio de los clientes, que garantice a los mismos comodidad, buena gestión, calidad y una agradable experiencia de compra, al igual que confianza y seguridad en el proceso.
            </p>
          </div>
        </div>
      </div>
    </div>
            </main>
    </div>

  );
};

export default AboutPage;