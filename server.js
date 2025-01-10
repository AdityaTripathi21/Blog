import express from "express";
import fs, { read } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function readArticles() {
    const filePath = path.join(__dirname, 'data', 'articles.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

function writeArticles(articles) {
    const filePath = path.join(__dirname, 'data', 'articles.json');
    try { 
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf8');
    }
    catch (error) {
        console.error(error);
    }
}



const userCreds = {username: 'adi', password: 'trip'};

app.get('/', (req, res) => {
    const articles = readArticles();
    const content = `
        <h2>Articles</h2>
        <ul>
            ${articles
                .map(
                    article => `
                        <li>
                            <h3><a href="/article/${article.id}">${article.title}</a></h3>
                            <p>${article.date}</p>
                            <p>${article.content}</p>
                        </li>
                    `
                )
                .join('')}
        </ul>
    `;

    res.render('layout', { title: 'Home', content }); 
});

app.get('/article/:id', (req, res) => {
    const articles = readArticles();
    const article = articles.find(a => a.id === parseInt(req.params.id));
    if (!article) return res.status(404).send('Article not found');

    const content = `
        <h1>${article.title}</h1>
        <p>${article.content}</p>
    `;

    res.render('layout', { title: article.title, content });
});

app.get('/login', (req, res) => {
    res.render('login', {title: 'Login', error: null});
});

app.post('/login', (req, res) => {
    const user = {username: req.body.username, password: req.body.password};
    if (user.username === userCreds.username && user.password === userCreds.password) {
        res.redirect('/admin');
    }
    else {
        res.status(401).render('login', { title: 'Login', error: 'Invalid credentials'});
    }
});

app.get('/admin', (req, res) => {
    const articles = readArticles();
    res.render('dashboard', {title: 'Admin Dashboard', articles});
});

app.get('/admin/add', (req, res) => {
    res.render('add', { title: 'Add New Article' });
});

app.post('/admin/add', (req, res) => {
    const articles = readArticles();
    const newArticle = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content,
        date: new Date().toISOString().split('T')[0],
    };
    articles.push(newArticle);
    writeArticles(articles);
    res.redirect('/admin');
});

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});