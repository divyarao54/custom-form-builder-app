const Layout = ({ children }) => {
    return (
        <div className="layout">
            {/* Add your layout components here, like header, footer, etc. */}
            <main>
                {children}
            </main>
        </div>
    );
}
export default Layout;