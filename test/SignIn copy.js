import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet, Keyboard, ScrollView, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import RNPrint from 'react-native-print';
import Header from './Header';
import LogIn from './LogIn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';


const SignIn = () => {
    const [inputCode, setInputCode] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [counter, setCounter] = useState(getInitialCounter()); // Initial counter value
    const [lastEntryDate, setLastEntryDate] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [printedTickets, setPrintedTickets] = useState(0);
    const [userName, setUserName] = useState('');
    const [userMatricule, setUserMatricule] = useState('');
    const [showButton, setShowButton] = useState(true); // State variable to control button visibility


    // Update the user's name when logging in
    const handleUserName = (name) => {
        setUserName(name);
    };

    // Update the user's matricule when logging in
    const handleUserMatricule = (matricule) => {
        setUserMatricule(matricule);
    };



    // Update the isLoggedIn state based on the login status
    const handleLoginStatus = (status) => {
        setIsLoggedIn(status);
    };

    // Get the initial counter value based on the current year
    function getInitialCounter() {
        const currentYear = new Date().getFullYear();
        return currentYear * 100000 + 1;
    }


    // Database connection
    const db = SQLite.openDatabase(
        {
            name: 'mydb',
            location: 'default',
        },
        () => {
            console.log('Database connected!');
            createTable(); //to create new tables
        },
        (error) => console.log('Database error', error)
    );


    const handleLogout = () => {
        const totalPrice = printedTickets * 50; // Calculate the total price
        const printContent = `<html>
        <head>
          <style>     
            .custom-heading {
               text-align: center;
               display: flex;
               justify-content: center;
               align-items: center;
               margin-bottom: 24px;
            }          
            .date-time-container {
               display: flex;
               justify-content: space-between;
               align-items: center;
               margin-bottom: 24px;
               margin-top: 24px;
            }
            .date {
              text-align: left;
              font-size: 25px;
            }            
            .time {
              text-align: right;
              font-size: 25px
            }
          </style>
        </head>
        <body>
          
        <h1 class="custom-heading">المؤسسة العمومية الاقتصادية</h1>
        <h1 class="custom-heading">لنقل المسافرين بالشرق</h1>
        <h1 class="custom-heading">الوحدة 33 سطيف - المحطة البرية العلمة</h1>
        <h1 class="custom-heading">حقوق الدخول لسيارات الاجرة</h1>
        <div class="date-time-container">
          <h1 class="date"> اليوم: ${currentDate}</h1>
          <h1 class="time"> الوقت: ${currentTime}</h1>
        </div>      
        <h1 class="custom-heading"> الثمن الجملي : ${totalPrice} د.ج</h1>
        <h1 class="custom-heading"> الخلاص :${userName} </h1>
        <h1 class="custom-heading"> رقم التسجيل :${userMatricule}</h1>
          
        </body>
      </html>`;
        Alert.alert(
            'نهاية العمل',
            'هل انت متأكد ؟',
            [{
                text: 'نعم',
                onPress: () => {
                    setShowButton(true); // show the button again
                    RNPrint.print({ html: printContent });
                    setPrintedTickets(0); // Reset printedTickets count
                    setIsLoggedIn(false);
                    saveEntry2ToDatabase(userName, userMatricule, currentTime, currentDate, totalPrice);

                },
            },
            {
                text: 'إلغاء',
                style: 'cancel',
            },
            ]
        );
    };


    // Update the counter value when the year changes
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const initialCounter = currentYear * 100000 + 1;
        setCounter(initialCounter);

        const createTable = () => {
            db.transaction((tx) => {
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS counter (value INTEGER PRIMARY KEY)'
                );
                console.log('Counter table created successfully');

                // Check if counter value exists in the database
                tx.executeSql(
                    'SELECT value FROM counter',
                    [],
                    (_, result) => {
                        if (result.rows.length === 0) {
                            // If no counter value exists, insert the initial value
                            tx.executeSql(
                                'INSERT INTO counter (value) VALUES (?)',
                                [initialCounter],
                                () => console.log('Counter value inserted into the database'),
                                (_, error) => console.log('Error inserting counter value:', error)
                            );
                        } else {
                            // If counter value exists, update the state with the saved value
                            const savedCounter = result.rows.item(0).value;
                            setCounter(savedCounter);
                        }
                    },
                    (_, error) => console.log('Error retrieving counter value:', error)
                );
            });
        };

        // Call the createTable function
        createTable();
        createTable2();
    }, []);


    // Create the 'today' table 
    const createTable = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS today (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, entryTime TEXT, entryDate TEXT)'
            );
            console.log('Table created successfully');

        });
    };

    const createTable2 = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, matricule TEXT, entryDate TEXT, entryTime TEXT, totalPrice INTEGER)'
            );
            console.log('Entries table created successfully');
        });
    };
    


    // Current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // Save entry to database
    const saveEntryToDatabase = (code, time, date) => {
        console.log('Save Entry - Code:', code);
        console.log('Save Entry - Time:', time);
        console.log('Save Entry - Date:', date);

        // Check if any of the values are null or empty
        if (!code || !time || !date) {
            console.log('One or more input values are null or empty.');
            return;
        }

        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO today (code, entryTime, entryDate) VALUES (?, ?, ?)',
                [code, time, date],
                () => {
                    console.log('Entry saved to database');
                },
                (_, error) => {
                    console.log('Error saving entry to database:', error);
                    console.log('Query:', 'INSERT INTO today (code, entryTime, entryDate) VALUES (?, ?, ?)');
                    console.log('Values:', [code, time, date]);
                }
            );
        });
    };

    const saveEntry2ToDatabase = (name, matricule, time, date, totalPrice) => {
        console.log('Save Entry - Name:', name);
        console.log('Save Entry - Matricule:', matricule);
        console.log('Save Entry - Time:', time);
        console.log('Save Entry - Date:', date);
        console.log('Save Entry - Total Price:', totalPrice);
    
        // Check if any of the values are null or empty
        if (!name || !matricule || !time || !date || !totalPrice) {
            console.log('One or more input values are null or empty.');
            return;
        }
    
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO entries (name, matricule, entryTime, entryDate, totalPrice) VALUES (?, ?, ?, ?, ?)',
                [name, matricule, time, date, totalPrice],
                () => {
                    console.log('Entry saved to database');
                },
                (_, error) => {
                    console.log('Error saving entry to database:', error);
                    console.log('Query:', 'INSERT INTO entries (name, matricule, entryTime, entryDate, totalPrice) VALUES (?, ?, ?, ?, ?)');
                    console.log('Values:', [name, matricule, time, date, totalPrice]);
                }
            );
        });
    };
    

    // Update the counter value in the database
    const updateCounterInDatabase = (updatedCounter) => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE counter SET value = ?',
                [updatedCounter],
                () => console.log('Counter value updated in the database'),
                (_, error) => console.log('Error updating counter value:', error)
            );
        });
    };




    //verifier le code entré avec la BD 
    const verifyCode = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM today WHERE code = ? AND entryDate = ?',
                [inputCode, currentDate],
                (_, result) => {
                    if (result.rows.length > 0) {
                        Alert.alert('لا يمكن إدخال نفس الرقم مرتين في اليوم ');
                    } else {
                        tx.executeSql(
                            'SELECT * FROM code WHERE code = ?',
                            [inputCode],
                            (_, result) => {
                                if (result.rows.length > 0) {
                                    setVerificationResult('matched'); // Code exists
                                    setLastEntryDate(currentDate);
                                    saveEntryToDatabase(inputCode, currentTime, currentDate);
                                    setShowButton(false); // Hide the button if the code exists
                                } else {
                                    //setVerificationResult('not_matched'); // Code does not exist
                                    Alert.alert('رقم الطاكسي غير موجود', '', [
                                        {
                                            text: 'OK',
                                            onPress: () => {
                                                setInputCode('');
                                                setVerificationResult(null);
                                            },
                                        },
                                    ]);

                                }
                            },
                            (_, error) => {
                                console.log('Error verifying code:', error);
                            }
                        );
                    }
                },
                (_, error) => {
                    console.log('Error checking duplicate entry:', error);
                }
            );
        });
        Keyboard.dismiss();
    };

    // Print the entered data and icrement counter
    const printData = () => {
        const htmlContent = `<html>
        <head>
          <style>
            h1 {
              color: #333;
              font-size: 32px;
              margin-bottom: 24px;
            }
            
            .custom-heading {
              text-align: center;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 24px;

            }
            
            .date-time-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
              margin-top: 24px;

            }
            
            .date {
              text-align: left;
              font-size: 25px;
            }
            
            .time {
              text-align: right;
              font-size: 25px;
            }
            
            .right {
              text-align: right;
              margin-top: 20px;
              font-size: 29px;
              margin-bottom: 24px;

            }
          </style>
        </head>
        <body>
          <h1 class="custom-heading">EPE-TVE N° ${counter}</h1>
          <h1 class="custom-heading">المؤسسة العمومية الاقتصادية</h1>
          <h1 class="custom-heading">لنقل المسافرين بالشرق</h1>
          <h1 class="custom-heading">الوحدة 33 سطيف - المحطة البرية العلمة</h1>
          <h1 class="custom-heading">حقوق الدخول لسيارات الاجرة</h1>
          <div class="date-time-container">
            <h1 class="date"> اليوم: ${currentDate}</h1>
            <h1 class="time"> الوقت: ${currentTime}</h1>
          </div>      
          <h1 class="right">الثمن: 50 د.ج</h1>
          <h1 class="right">رقم الطاكسي: ${inputCode}</h1>
        </body>
      </html>`;
        RNPrint.print({ html: htmlContent });
        setInputCode(null);
        setVerificationResult(null);

        setCounter((updatedCounter) => {
            const newCounter = updatedCounter + 1;
            updateCounterInDatabase(newCounter); // Update counter value in the database
            return newCounter;
        });
        setPrintedTickets((prevTickets) => prevTickets + 1);
        setShowButton(true); // show the button again


    };


    //UI
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled">
            <View>
                {isLoggedIn ? (
                    <View>
                        <>
                            <Header />
                            <View style={styles.container}>
                                <Text style={styles.label}>رقم الطاكسي: </Text>
                                <TextInput
                                    value={inputCode}
                                    onChangeText={setInputCode}
                                    //secureTextEntry={true}
                                    keyboardType="numeric"
                                    placeholder=" "
                                    style={styles.input}
                                />


                                {verificationResult === 'not_matched' && (
                                    <Text style={styles.error}>الرقم غير موجود</Text>
                                )}
                                { /* {verificationResult === 'matched' && (
                                    <Text style={styles.correct}>الرقم موجود</Text>
                              )}*/}


                                {showButton && <Button title="اثبات" onPress={verifyCode} />}
                            </View>

                            {/*Display the button print if the code matches */}

                            {verificationResult === 'matched' && (
                                <View style={styles.buttonContainer}>
                                    <View style={[styles.button, { margin: 15 }]}>
                                        <Button title="طبع" onPress={printData} />
                                    </View>

                                </View>
                            )}

                        </>
                        {/* <Button title="Logout" onPress={handleLogout} /> */}
                        <View style={styles.exit}>
                            <TouchableOpacity onPress={handleLogout}>
                                <FontAwesomeIcon
                                    icon={faRightFromBracket}
                                    color="#000"
                                    size={30}
                                />
                                <Text style={styles.text}>نهاية العمل</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                ) : (
                    <LogIn onLoginStatus={handleLoginStatus} onUserName={handleUserName} onUserMatricule={handleUserMatricule} />
                )}
            </View>
        </ScrollView>
    );
};
//Styles
const styles = StyleSheet.create({
    modalContainer: {
        margin: 30,
        marginTop: 50,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        padding: 45,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        }
    },
    buttonContainer: {
        marginHorizontal: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
    },
    container: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 45,
        marginTop: 100,

    },
    exit: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 45,
        marginTop: 30,

    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: '#000',

    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    error: {
        color: 'red',
        marginBottom: 8,

    },
    correct: {
        color: 'green',
        marginBottom: 8,

    },
    text: {
        fontSize: 15,
        marginBottom: 8,
        color: '#000',

    },
});

export default SignIn;
