import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet, Keyboard, ScrollView, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import RNPrint from 'react-native-print';
import Header from './Header';
import LogIn from './LogIn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import * as permissions from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook





const SignIn = () => {
    const [inputCode, setInputCode] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [counter, setCounter] = useState(getInitialCounter()); // Initial counter value
    const [lastEntryDate, setLastEntryDate] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [printedTickets, setPrintedTickets] = useState(0);
    const [userName, setUserName] = useState('');
    const [userMatricule, setUserMatricule] = useState('');
    const [Login, setLogin] = useState('');
    const [showButton, setShowButton] = useState(true); // State variable to control button visibility


    // Update the user's name when logging in
    const handleUserName = (name) => {
        setUserName(name);
    };

    const handleLoginDate = (loginDate) => {
        setLogin(loginDate);
    }
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

    const checkInternetConnection = async () => {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected;
    };

    const navigation = useNavigation();

    const handleRegisterNewTaxi = () => {
        setInputCode('');
        navigation.navigate('NewTaxi'); // Navigate to the new page
    };


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
        
        </head>
        <body>
        <table width=100% style="font-size: 20px;font-weight: bold;" >
        <thead>
        <tr style="white-space: nowrap;font-size: 15px;">
            <td>${actualDate}</td>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 20px;">المؤسسة العمومية الاقتصادية لنقل المسافرين بالشرق</th>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 20px;">حقوق الدخول لسيارات الاجرة</th>
        </tr>   
        </thead>
        <tbody>
        <tr style="font-size: 20px;">  
        <td>${Login} </td>
        <td>: بداية العمل</td>
       </tr>
       <tr style="font-size: 20px;">  
       <td>${currentTime} </td>
       <td>: نهاية العمل</td>
       </tr>
        <tr style="white-space: nowrap;font-size: 20px;">
            <td>${totalPrice} د.ج </td>
            <td>: الثمن الجملي</td>
        </tr>
        <tr style="font-size: 20px;">  
            <td>${printedTickets} </td>
            <td>: عدد التذاكر</td>
        </tr>
        <tr style="font-size: 20px;">  
            <td>${userName} </td>
            <td>: القابض</td>
        </tr>
<tr style="font-size: 20px;">    
            <td>${userMatricule}</td>
            <td>: رقم التسجيل</td>
        </tr>
        </tbody>
       </table>
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
                    saveEntry2ToDatabase(userName, userMatricule, currentTime, actualDate, totalPrice);

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
        offline();
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

    const offline = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS offline_tickets ( id INTEGER PRIMARY KEY AUTOINCREMENT, ticketData TEXT )'
            );
            console.log('offline table created successfully');
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
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const actualDate = `${year}/${month}/${day}`;
    // console.log(actualDate); // Output: yyyy/mm/dd
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
                [inputCode, actualDate],
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
                                    setLastEntryDate(actualDate);
                                    saveEntryToDatabase(inputCode, currentTime, actualDate);
                                    setShowButton(false); // Hide the button if the code exists
                                } else {
                                    //setVerificationResult('not_matched'); // Code does not exist
                                    Alert.alert('رقم الطاكسي غير موجود', '', [
                                        {
                                            text: 'الغاء',
                                            onPress: () => {
                                                setInputCode('');
                                                setVerificationResult(null);
                                            },
                                        },
                                        {
                                            text: 'تسجيل طاكسي جديد',
                                            onPress: handleRegisterNewTaxi, // Call the function to navigate when the button is pressed

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



    /* const sendTicketToServer = (ticketData) => {
         fetch('http://41.226.178.8:5000/', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify(ticketData)
         })
             .then(response => {
                 // Handle the response from the server
                 if (response.ok) {
                     return response.json();
                 }
                 throw new Error('Error sending ticket to server');
             })
             .then(ticketData => {
                 console.log('Ticket sent to server successfully');
                 console.log(ticketData);
             })
             .catch(error => {
                 // Handle the error
                 console.log('Error sending ticket to server:', error);
                  console.log(ticketData);
             });
     };*/
    const sendTicketToServer = (ticketData) => {
        fetch('http://41.226.178.8:5000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        })
            .then(response => {
                // Check if the response status is not 2xx (indicating an error)
                if (!response.ok) {
                    throw new Error('Error sending ticket to server');
                }
                // Parse the response as text (not JSON) and return it
                return response.text();
            })
            .then(responseText => {
                console.log('Ticket sent to server successfully');
                // Parse the response text as JSON and log it
                const responseData = JSON.parse(responseText);
                console.log(responseData);
            })
            .catch(error => {
                // Handle the error
                console.log('Error sending ticket to server:', error);
            });
    };



    /* const saveTicketToLocalDatabase = (ticketData) => {
       db.transaction((tx) => {
           tx.executeSql(
               'INSERT INTO offline_tickets (counter, actualDate, currentTime, inputCode) VALUES (?, ?, ?, ?)',
               [ticketData.counter, ticketData.actualDate, ticketData.currentTime, ticketData.inputCode],
               () => console.log('Ticket saved to local database'),
               (_, error) => console.log('Error saving ticket to local database:', error)
           );
       });
   };*/
    const saveTicketToLocalDatabase = (ticketData) => {
        // Perform the database insertion after the GET request is successful
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO offline_tickets (ticketData) VALUES (?)',
                [JSON.stringify(ticketData)], // Serialize the object to JSON
                (_, resultSet) => {
                    if (resultSet.insertId) {
                        console.log('Ticket saved to local database with ID:', resultSet.insertId);
                        sendDataToMongoDB(ticketData); // Call the function to send data to MongoDB
                    } else {
                        console.log('Error saving ticket to local database: Unable to get the insert ID');
                    }
                },
                (_, error) => console.log('Error saving ticket to local database:', error)
            );
        });
    };

   /* const sendDataToMongoDB = async (data) => {
        try {
            const response = await fetch('http://41.226.178.8:5000/SendData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                console.log('Data sent to MongoDB successfully');
            } else {
                console.error('Failed to send data to MongoDB');
            }
        } catch (error) {
            console.error('Error sending data to MongoDB', error);
        }
    };*/




    // Print the entered data and icrement counter
    const printData = async () => {
        const htmlContent = `<html>
        <head>
        </head>
        <body>
        <table width=100% style="font-size: 20px;font-weight: bold;" >
        <thead>
        <tr style="white-space: nowrap;">
            <th colspan="2" style="font-size: 20px;">EPE-TVE N° ${counter}</th>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 20px;">المؤسسة العمومية الاقتصادية لنقل المسافرين بالشرق</th>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 20px;">حقوق الدخول لسيارات الاجرة</th>
        </tr>
                
        </thead>

        <tbody>
        <tr style="white-space: nowrap;font-size: 20px;">
            <td>${actualDate}</td>
            <td>${currentTime}</td>
        </tr>
        <tr style="white-space: nowrap;font-size: 20px;">
            
            <td>د.ج 50 </td>
            <td>: الثمن</td>
        </tr>
        <tr style="font-size: 20px;">
            
            <td>${inputCode}</td>
            <td>:الطاكسي</td>
        </tr>


        </tbody>
       

        </table>
          
        </body>
      </html>`;
        RNPrint.print({ html: htmlContent });
        setInputCode(null);
        setVerificationResult(null);

        const ticketData = {
            counter: counter,
            actualDate: actualDate,
            currentTime: currentTime,
            inputCode: inputCode
        };

        const isConnected = await checkInternetConnection();

        if (isConnected) {
            saveTicketToLocalDatabase(ticketData);
            sendTicketToServer(ticketData);
        } else {
            saveTicketToLocalDatabase(ticketData);
        }

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
                                <View>
                                    <LottieView
                                        source={require('../lotties/taxi.json')}
                                        autoPlay
                                        loop
                                        style={{ width: 200, height: 200 }}
                                    />
                                </View>
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
                    <LogIn onLoginStatus={handleLoginStatus} onUserName={handleUserName} onLoginDate={handleLoginDate} onUserMatricule={handleUserMatricule} />
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
        // marginTop: 100,

    },
    exit: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        //marginTop: 5,

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
