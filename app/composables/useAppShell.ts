export function useAppShell() {
    const sidebarOpen = useState('app-shell-sidebar', () => false)

    function openSidebar() {
        sidebarOpen.value = true
    }

    function closeSidebar() {
        sidebarOpen.value = false
    }

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value
    }

    return { sidebarOpen, openSidebar, closeSidebar, toggleSidebar }
}
