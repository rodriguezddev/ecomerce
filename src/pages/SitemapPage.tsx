
import Header from "@/components/Header";
import React from "react";

const SitemapPage = () => {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-md">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                Mapa del Sitio y Ubicación
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Encuéntranos en Naguanagua, Estado Carabobo. ¡Te esperamos!
              </p>
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.826721532968!2d-68.0176478257851!3d10.26362406815349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e805df26dfafea5%3A0xfe40bcafdbcd67be!2sRepuestos%20y%20Accesorios%20M%26C7%20c.a!5e0!3m2!1sen!2sve!4v1718911891547!5m2!1sen!2sve"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SitemapPage;
