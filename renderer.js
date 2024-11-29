const svenInput = document.getElementById('svenInput')

svenInput.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const formData = new FormData(svenInput);

    const data = Object.fromEntries(formData)

    window.electronAPI.svenInputPreload(data.input)
})