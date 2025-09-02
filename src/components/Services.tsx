
import { Truck, CreditCard, BarChart2, Headset, Banknote, PackageCheck } from "lucide-react";

const services = [
  {
    id: 1,
    icon: Headset,
    title: "Asesoramiento",
  },
  {
    id: 2,
    icon: Banknote,
    title: "Aceptamos pago móvil y zelle",
  },
  {
    id: 3,
    icon: Truck,
    title: "Envío a todo el país",
  },
  {
    id: 4,
    icon: PackageCheck,
    title: "Delivery en la ciudad",
  },
];

const Services = () => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white border border-gray-200 rounded-lg p-6 pt-0 flex items-center"
          >
            <div className="mr-4 text-primary">
              <service.icon size={36} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{service.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
