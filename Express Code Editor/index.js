import express from "express";
import cors from "cors";
import session from "express-session";
import nodemailer from "nodemailer";
import fs from "fs";
//import { connectDB, getConnection } from "./DButils/dbutil.js";
import { exec } from "child_process";

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true
}));
app.use(session({
    secret: "prithviraj",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,  // Set to true for HTTPS
    },
}));

// const transport = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: "temporary9665@gmail.com",
//         pass: "fkuw zykc jmop oejz"
//     }
// })

let email1 = "";


//const connection = connectDB();


//app.post("/", (req, res) => {
    try {
        const { email } = req.body;
        // console.log(req);

        if (!email) {
            return res.status(400).send({ msg: "Email is required" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.otp = otp;
        req.session.email = email;
        email1 = email;
        // console.log(req.session);

        console.log(`Generated OTP for ${email}: ${otp}`);


        connection.query(`SELECT * FROM students WHERE email='${email}'`, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ msg: "Database error" });
            }

            if (result.length > 0) {
                // await transport.sendMail({
                //     to: `${result[0].email}`,
                //     subject: "OTP Verification",
                //     html: `<h2>OTP verification: ${otp}</h2>`
                // })
                if (result[0].password === null) {

                    // res.redirect("/otpverify");
                    return res.status(200).send({ msg: "OTP generated successfully" });
                } else {
                    return res.status(201).send({ msg: "Already has an password" });
                }
            } else {
                return res.status(204).send({ msg: "Email not found" });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "Internal server error" });
    }
});


app.post("/verify", (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(203).send({ msg: "OTP is required" });
        }

        console.log(req.session.email);
        if (parseInt(otp) === 1234) {

            // Clear the OTP after successful verification
            req.session.otp = null;
            return res.status(200).send({ msg: "OTP verified successfully" });
        } else {
            return res.status(204).send({ msg: "Invalid or expired OTP" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "Internal server error" });
    }
});

app.post("/addpassword", (req, res) => {
    try {
        const { password } = req.body;
        // console.log(req);

        if (!password) {
            return res.status(400).send({ msg: "Password is required" });
        }


        console.log(email1, password);

        connection.query(`update students set password='${password}' where email='${email1}'`, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ msg: "Database error" });
            }


            // await transport.sendMail({
            //     to: `${result[0].email}`,
            //     subject: "OTP Verification",
            //     html: `<h2>OTP verification: ${otp}</h2>`
            // })


            // res.redirect("/otpverify");
            const data1 = result[0];
            return res.status(200).send({ msg: "Password Updated", data1 });


        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "Internal server error" });
    }
});

app.post("/verifypassword", (req, res) => {
    try {
        const { password } = req.body;
        // console.log(req);

        if (!password) {
            return res.status(400).send({ msg: "Email is required" });
        }



        console.log(email1, password);
        connection.query(`SELECT * FROM students WHERE email='${email1}' and password='${password}'`, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ msg: "Database error" });
            }

            if (result.length > 0) {
                // await transport.sendMail({
                //     to: `${result[0].email}`,
                //     subject: "OTP Verification",
                //     html: `<h2>OTP verification: ${otp}</h2>`
                // })
                console.log(result[0]);
                const data1 = result[0];
                res.status(200).send({ msg: "Login Success", data1 });

            } else {
                return res.status(204).send({ msg: "Email not found" });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "Internal server error" });
    }
});




app.use(express.text());

app.post("/editor", (req, res) => {
    const data = req.body;


    try {
        fs.writeFileSync("Practice.java", data, "utf8");
    } catch (err) {
        console.error("File write error:", err);
        return res.status(500).send({ msg: "Error writing file" });
    }


    exec("javac Practice.java", (err, stdout, stderr) => {
        if (err || stderr) {
            console.error("Compilation error:", err || stderr);
            return res.status(203).send({ msg: stderr });
        }


        exec("java Practice", (err, stdout, stderr) => {

            try {
                fs.unlinkSync("Practice.java");
                fs.unlinkSync("Practice.class");
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }

            if (err || stderr) {
                console.error("Execution error:", err || stderr);
                return res.status(203).send({ msg: stderr });
            }


            res.status(200).send({ msg: stdout });
        });
    });
});


app.listen(9800, () => {
    console.log("Server is running on port 9800...");
    getConnection();
});
