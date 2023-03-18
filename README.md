# Install REST Client extension for working with .rest

---

# encode images with base64

```
const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });

```

### USAGE

```
const image = await toBase64(form.querySelector(".img").files[0]);
```

### AFTER FETCHING

```
// After fetching data
const product = fetch("url");
const img = document.querySelector(".out-img");

img.src = product.image;
```
