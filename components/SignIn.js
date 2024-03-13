import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Alert, StyleSheet, Pressable, Keyboard, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import RNPrint from 'react-native-print';
import Header from './Header';
import LogIn from './LogIn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
//import LottieView from 'lottie-react-native';
import NetInfo from '@react-native-community/netinfo';
import * as permissions from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import utf8 from 'utf8';
import Logo from '../images/logoicon.png';
import Toast from 'react-native-toast-message';





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
    const [selectedButtonIndex, setSelectedButtonIndex] = useState(-1);
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const [selectedButtonPrice, setSelectedButtonPrice] = useState(null); // No default price
    const [totalPrice, setTotalPrice] = useState(0);


    /*  useEffect(() => {
          const storedYear = parseInt(Login.substring(0, 4)); // Extract the year from the login date
          const currentYear = new Date().getFullYear();
  
          if (currentYear !== storedYear) {
              const initialCounter = currentYear * 100000 + 1;
              setCounter(initialCounter);
              updateCounterInDatabase(initialCounter); // Update the counter value in the database for the new year
          } else {
              // Counter value remains the same if it's still the same year
              setCounter(getInitialCounter());
          }
  
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
      }, []);*/



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
        setTotalPrice(0); // Reset totalPrice to zero
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


    useEffect(() => {
        // Check for stored state when the app starts
        restoreAppState();
    }, []);

    useEffect(() => {
        // Save app state whenever it changes
        saveAppState();
    }, [isLoggedIn, printedTickets, totalPrice, Login, userName, userMatricule]);

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

    const saveAppState = async () => {
        try {
            await AsyncStorage.setItem('isLoggedIn', isLoggedIn.toString()); // Assuming isLoggedIn is a boolean
            await AsyncStorage.setItem('printedTickets', printedTickets.toString()); // Assuming printedTickets is a number
            await AsyncStorage.setItem('totalPrice', totalPrice.toString()); // Assuming totalPrice is a number
            await AsyncStorage.setItem('Login', Login); // Assuming Login is a string
            await AsyncStorage.setItem('userName', userName); // Assuming userName is a string
            await AsyncStorage.setItem('userMatricule', userMatricule); // Assuming userMatricule is a string

        } catch (error) {
            console.error('Error saving app state:', error);
        }
    };

    const restoreAppState = async () => {
        try {
            // Restore app state from AsyncStorage
            const storedIsLoggedIn = await AsyncStorage.getItem('isLoggedIn');
            const storedPrintedTickets = await AsyncStorage.getItem('printedTickets');
            const storedtotalPrice = await AsyncStorage.getItem('totalPrice');
            const storedLogin = await AsyncStorage.getItem('Login');
            const storedName = await AsyncStorage.getItem('userName');
            const storedMatricule = await AsyncStorage.getItem('userMatricule');

            // Convert stored values to their original types
            setIsLoggedIn(storedIsLoggedIn === 'true');
            setPrintedTickets(parseInt(storedPrintedTickets, 10));
            setTotalPrice(parseInt(storedtotalPrice, 10));
            setLogin(storedLogin);
            setUserName(storedName);
            setUserMatricule(storedMatricule);

        } catch (error) {
            console.error('Error restoring app state:', error);
        }
    };


    const handleLogout = () => {
        const totalPrice = printedTickets * 500;
        //DT= dernier ticket 
        const DT = counter - 1;
        //PT= premier ticket
        const PT = counter - printedTickets;
        const printContent = `<html>
        <head>
        
        </head>
        <body>
        <table width=100% style="font-size: 18px;font-weight: bold;" >
        <thead>
        <tr>
        <td colspan="2">
            <img src="${Logo}" alt=" ">
        </td>
    </tr>
        
        <tr>
            <th colspan="2" style="font-size: 18px;">المؤسسة العمومية الاقتصادية لنقل المسافرين بالشرق</th>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 18px;">مركز الفحص التقني سطيف</th>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 18px;">FIN DE SERVICE</th>
        </tr>   
        <tr style="white-space: nowrap;font-size: 18px;">
            <td>${actualDate}</td>
        </tr>
        </thead>
        <tbody>
        <tr style="font-size: 18px;">  
        <td> H.D.S :</td>
        <td>${Login} </td>
       </tr> 
       <tr style="font-size: 18px;"> 
       <td> Cloturé :</td> 
       <td>${currentTime} </td>

       </tr>
       <tr style="font-size: 18px;"> 
       <td> Nb : </td> 
           <td>${printedTickets} </td>
       </tr>
        <tr style="white-space: nowrap;font-size: 18px;">
         <td> Prix total : </td>
        </tr>
        <tr style="white-space: nowrap; font-size: 18px; text-align: center;">
        <td colspan="2">${totalPrice}.00 D.A</td>
    </tr>
    <tr style="white-space: nowrap;font-size: 18px;">
    <th colspan="2">Premier tk:  ${PT}</th>
</tr>
    <tr style="white-space: nowrap;font-size: 18px;">
    <th colspan="2">Dernier tk:  ${DT}</th>
</tr>
       
       <!-- <tr style="font-size: 18px;"> 
        <td> Nom : </td> 
            <td>${userName} </td>
        </tr>
<tr style="font-size: 18px;">   
<td> Matricule : </td> 
            <td>${userMatricule}</td>
        </tr> --> 
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
                    setSelectedButtonIndex(-1); // Reset selectedButtonIndex to indicate no button is selected
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
    /*  useEffect(() => {
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
      }, []);*/
    useEffect(() => {
        const storedYear = parseInt(Login.substring(0, 4)); // Extract the year from the login date
        const currentYear = new Date().getFullYear();

        if (currentYear !== storedYear) {
            const initialCounter = currentYear * 100000 + 1;
            setCounter(initialCounter);
            updateCounterInDatabase(initialCounter); // Update the counter value in the database for the new year
        } else {
            // Counter value remains the same if it's still the same year
           
            setCounter(getInitialCounter());
        }

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

    const insertCodeIntoTable = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO code (code) VALUES (?)',
                [parseInt(inputCode)],
                (tx, results) => {
                    console.log('Code inserted successfully');
                },
                (error) => {
                    console.log('Insert code error', error);
                }
            );
        });
    };


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

    const sendDataToMongoDB = async (data) => {
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
    };




    // Print the entered data and icrement counter
    const printData = async () => {
        const currentDate = new Date().toLocaleDateString();
        const storedMatricules = await AsyncStorage.getItem('printedMatricules');
        const parsedMatricules = storedMatricules ? JSON.parse(storedMatricules) : [];

        if (parsedMatricules.includes(inputCode) && parsedMatricules.includes(currentDate)) {
            // Matricule has been entered before on the same day
            console.log('Matricule already entered today. Cannot print another ticket.');
            //showMatriculeEnteredToast();
            return;
        }

        // Matricule is valid for printing
        parsedMatricules.push(inputCode);
        parsedMatricules.push(currentDate);

        await AsyncStorage.setItem('printedMatricules', JSON.stringify(parsedMatricules));

        const htmlContent = `<html>
        <head>
        </head>
        <body >
        <table width=50px style="font-size: 18px;font-weight: bold;" >
        <thead>
        
        <tr>
            <th colspan="2" style="font-size: 20px;">المؤسسة العمومية الاقتصادية لنقل المسافرين بالشرق</th>
        </tr>
        <tr>
            <th colspan="2" style="font-size: 20px;">مركز الفحص التقني سطيف</th>
        </tr> 
        <tr style="white-space: nowrap;">
            <th colspan="2" style="font-size: 18px;">TICKET N° ${counter}</th>
        </tr>
                
        </thead>

        <tbody>
        <tr style="white-space: nowrap;font-size: 16px;">
            <td>${actualDate}</td>
            <td>${currentTime}</td>
        </tr>
        <tr style="font-size: 15px;">
            
            
        <td>Prix : </td>
        <td>500.00 DA</td>  
        </tr>

        <tr style="font-size: 16px;">
                        
            <td>Matricule : </td>
            <td>${inputCode}</td>
            
            </tr>


        </tbody>
       

        </table>
          
        </body>
      </html>`;
        // const encodedHtmlContent = utf8.encode(htmlContent);
        RNPrint.print({ html: htmlContent });
        setInputCode(null);
        setVerificationResult(null);
        setSelectedButtonIndex(-1); // Reset selectedButtonIndex to indicate no button is selected

        const ticketData = {
            counter: counter,
            actualDate: actualDate,
            currentTime: currentTime,
            numeroTaxi: inputCode,
            Price: selectedButtonPrice,
            matricule: userMatricule,
            name: userName
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

    const total = printedTickets * 50;

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

                                </View>
                                <View style={styles.container}>
                                    <View style={styles.redBox}>
                                        <Text style={styles.box}>المجموع : {total}.00 د.ج </Text>
                                        <Text style={styles.box}>عدد التذاكر : {printedTickets}</Text>
                                    </View>

                                </View>
                                <>

                                    <Text style={styles.label}> Immatriculation : </Text>
                                    <TextInput
                                        value={inputCode}
                                        onChangeText={setInputCode}
                                        //secureTextEntry={true}
                                        keyboardType="numeric"
                                        placeholder=" "
                                        maxLength={10}
                                        style={[styles.input, { fontSize: 40 }]}
                                    />

                                    {verificationResult === 'not_matched' && (
                                        <Text style={styles.error}>الرقم غير موجود</Text>
                                    )}

                                    {showButton && (
                                        <View style={styles.btnContainer}>
                                            <TouchableOpacity onPress={printData}>
                                                <FontAwesomeIcon
                                                    icon={faPrint}
                                                    beatFade
                                                    color="#FF5733"
                                                    size={50}
                                                />
                                            </TouchableOpacity>

                                        </View>

                                    )}

                                    {/* <Button title="Logout" onPress={handleLogout} /> */}
                                    <View style={styles.exit}>
                                        <TouchableOpacity onPress={handleLogout}>
                                            <FontAwesomeIcon
                                                icon={faRightFromBracket}
                                                color="black"
                                                size={30}
                                            />
                                            <Text style={styles.text}>نهاية العمل</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>

                            </View>




                        </>


                    </View>

                ) : (
                    <LogIn onLoginStatus={handleLoginStatus} onUserName={handleUserName} onLoginDate={handleLoginDate} onUserMatricule={handleUserMatricule} />
                )}

            </View>
        </ScrollView>
    );
};
const { width } = Dimensions.get('window');

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
        flexDirection: 'row',
        // flexWrap: 'wrap',
        //justifyContent: 'space-between',
        // width: '100%', // Adjust the width as needed
        paddingHorizontal: 20, // Adjust the horizontal padding as needed
        marginTop: 50, // Adjust the top margin as needed
        position: 'relative',
    },
    button: {
        flex: 1,
        height: 60,
        alignItems: 'center', // Center text horizontally
        justifyContent: 'center', // Center text vertically

    },
    redBox: {
        borderWidth: 2,
        borderColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 45,
        // marginTop: 100,

    },
    exit: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 5,


    },
    label: {
        fontSize: 30,
        marginBottom: 8,
        color: '#000',
        fontWeight: 'bold',
    },
    box: {
        fontSize: 18,
    },
    input: {
        height: '25%',
        width: '100%',
        borderColor: 'gray',
        borderWidth: 2,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 5, // Adjust the top margin as needed
    },
    btn: {
        flexBasis: width >= 768 ? '30%' : '48%', // Adjust the percentage as needed
        height: '120%', // Change the height as desired
        marginHorizontal: 10, // Adjust the horizontal margin to add space between buttons
        borderRadius: 5, // Add border radius if you want rounded corners
        alignItems: 'center',
        justifyContent: 'center',
        // Add any other styles you want to apply to your buttons
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,


    },
    btnText: {
        color: '#FF5733',
        fontWeight: 'bold',
        fontSize: 20,
    },
    btnContainer: {
        width: '100%',
        marginTop: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // padding: 20,

    },

    printer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default SignIn;
