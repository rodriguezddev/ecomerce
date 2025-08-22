import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

const ContactPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12">
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
