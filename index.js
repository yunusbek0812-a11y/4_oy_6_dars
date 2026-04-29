const http = require("http");
const { read_file, write_file } = require("./filesystem/fs");
const { v4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { writeFile } = require("fs");
const { sendMessage } = require("./utils/email-sender");

const options = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
const app = http.createServer((req, res) => {
  // register
  if (req.method === "POST" && req.url === "/register") {
    req.on("data", async (chunk) => {
      const { username, email, password } = JSON.parse(chunk);

      if (!username || !email || !password) {
        res.writeHead(400, options);
        return res.end(
          JSON.stringify({
            messsage: "username, email,password, are required ",
          }),
        );
      }

      const users = read_file("users.json");

      const foundeUsername = users.find((user) => user.username === username);

      if (foundeUsername) {
        res.writeHead(400, options);
        return res.end(
          JSON.stringify({
            messsage: "Username already taken",
          }),
        );
      }

      const foundeEmail = users.find((user) => user.email === email);
      if (foundeEmail) {
        res.writeHead(400, options);
        return res.end({
          messsage: "Email already exists",
        });
      }

      const hashPassword = await bcrypt.hash(password, 12);

      const randomNumber = Array.from(
        { length: 6 },
        () => Math.floor(Math.random() * 9),
        join(""),
      );

      await sendMessage(email, randomNumber);

      users.push({
        id: v4(),
        username,
        email,
        password: hashPassword,
        otp: randomNumber,
      });

      write_file("users.json", users);
      res.writeHead(201, options);
      res.end(
        JSON.stringify({
          messsage: "Registered",
        }),
      );
    });
  }

  // login
  if (req.method === "POST" && req.url === "/login") {
    req.on("data", async (chunk) => {
      const { email, password } = JSON.parse(chunk);

      const users = read_file("users.json");

      const foundeUser = users.find((item) => item.email == email);

      if (!foundeUser) {
        res.writeHead(401, options);
        return res.end(
          JSON.stringify({
            messsage: "User not found",
          }),
        );
      }

      const checkPassword = await bcrypt.compare(password, foundeUser.password);

      if (checkPassword) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "baxtiyorovbehruz962@gmail.com",
            pass: "shu yer qoldi! ...",
          },
        });

        const randomNumber = Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 9),
        );
        await transporter.sendMail({
          from: "baxtiyorovbehruz962@gmail.com",
          to: email,
          subject: "Lesson",
          text: randomNumber,
        });

        users.forEach((item) => {
          if (item.email === email) {
            item.otp = randomNumber;
          }
        });
      }

      if (checkPassword) {
        const randomNumber = Array.from(
          { length: 6 },
          () => Math.floor(Math.random() * 9),
          join(""),
        );

        await sendMessage(email, randomNumber);

        users.forEach((item) => {
          if (item.email === email) {
            item.otp = randomNumber;
          }
        });

        write_file("users.json", users);
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            messsage: "Success",
          }),
        );
      } else {
        res.writeHead(401, options);
        res.end(
          JSON.stringify({
            messsage: "Wrong password",
          }),
        );
      }
    });
  }

  // verify

  if (req.method === "POST" && req.url === "/verify") {
    req.on("data", (chunk) => {
      const { emil, otp } = JSON.parse(chunk);

      const users = read_file("users.json");

      const foundeEmail = users.find((item) => item.email === email);

      if (!foundeEmail) {
        res.writeHead(401, options);
        return res.end(
          JSON.stringify({
            messsage: "Email not  found",
          }),
        );
      }

      if (!foundeEmail.otp) {
        res.writeHead(401, options);
        return res.end(
          JSON.stringify({
            messsage: "Otp not  found",
          }),
        );
      }

      if (foundeEmail.otp !== otp) {
        res.writeHead(401, options);
        return res.end(
          JSON.stringify({
            messsage: "Wrong otp",
          }),
        );
      }

      users.forEach((users) => {
        if (users.email === email) {
          user.otp = "";
        }
      });

      write_file("user.json", users);
      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          messsage: "Success",
        }),
      );
    });
  }



    // CREATE (hodim qo'shish)
  if (req.method === "POST" && req.url === "/employees") {
    req.on("data", (chunk) => {
      const { name, position } = JSON.parse(chunk);

      if (!name || !position) {
        res.writeHead(400, options);
        return res.end(JSON.stringify({ message: "name va position kerak" }));
      }

      const employees = read_file("employees.json");

      employees.push({
        id: v4(),
        name,
        position,
      });

      write_file("employees.json", employees);

      res.writeHead(201, options);
      res.end(JSON.stringify({ message: "Hodim qo‘shildi" }));
    });
  }

  // READ (hamma hodimlar)
  if (req.method === "GET" && req.url === "/employees") {
    const employees = read_file("employees.json");

    res.writeHead(200, options);
    return res.end(JSON.stringify(employees));
  }

  // UPDATE
  if (req.method === "PUT" && req.url.startsWith("/employees/")) {
    const id = req.url.split("/")[2];

    req.on("data", (chunk) => {
      const { name, position } = JSON.parse(chunk);

      const employees = read_file("employees.json");

      const index = employees.findIndex((e) => e.id === id);

      if (index === -1) {
        res.writeHead(404, options);
        return res.end(JSON.stringify({ message: "Topilmadi" }));
      }

      employees[index] = {
        ...employees[index],
        name,
        position,
      };

      write_file("employees.json", employees);

      res.writeHead(200, options);
      res.end(JSON.stringify({ message: "Yangilandi" }));
    });
  }

  // DELETE
  if (req.method === "DELETE" && req.url.startsWith("/employees/")) {
    const id = req.url.split("/")[2];

    let employees = read_file("employees.json");

    employees = employees.filter((e) => e.id !== id);

    write_file("employees.json", employees);

    res.writeHead(200, options);
    res.end(JSON.stringify({ message: "O‘chirildi" }));
  }

  // ================= MEDICINES =================

  // CREATE
  if (req.method === "POST" && req.url === "/medicines") {
    req.on("data", (chunk) => {
      const { name, price } = JSON.parse(chunk);

      if (!name || !price) {
        res.writeHead(400, options);
        return res.end(JSON.stringify({ message: "name va price kerak" }));
      }

      const medicines = read_file("medicines.json");

      medicines.push({
        id: v4(),
        name,
        price,
      });

      write_file("medicines.json", medicines);

      res.writeHead(201, options);
      res.end(JSON.stringify({ message: "Dori qo‘shildi" }));
    });
  }

  // READ
  if (req.method === "GET" && req.url === "/medicines") {
    const medicines = read_file("medicines.json");

    res.writeHead(200, options);
    res.end(JSON.stringify(medicines));
  }

  // UPDATE
  if (req.method === "PUT" && req.url.startsWith("/medicines/")) {
    const id = req.url.split("/")[2];

    req.on("data", (chunk) => {
      const { name, price } = JSON.parse(chunk);

      const medicines = read_file("medicines.json");

      const index = medicines.findIndex((m) => m.id === id);

      if (index === -1) {
        res.writeHead(404, options);
        return res.end(JSON.stringify({ message: "Topilmadi" }));
      }

      medicines[index] = {
        ...medicines[index],
        name,
        price,
      };

      write_file("medicines.json", medicines);

      res.writeHead(200, options);
      res.end(JSON.stringify({ message: "Yangilandi" }));
    });
  }

  // DELETE
  if (req.method === "DELETE" && req.url.startsWith("/medicines/")) {
    const id = req.url.split("/")[2];

    let medicines = read_file("medicines.json");

    medicines = medicines.filter((m) => m.id !== id);

    write_file("medicines.json", medicines);

    res.writeHead(200, options);
    res.end(JSON.stringify({ message: "O‘chirildi" }));
  }

});

app.listen(3000, () => {
  console.log("Ishladi");
});
