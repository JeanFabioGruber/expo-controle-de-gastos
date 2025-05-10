import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, View, FlatList, Alert } from "react-native";
import { db } from '../firebase';
import { DangerButton, PrimaryButton, SecondaryButton } from "../components/Buttons";
import { CustomTextInput } from "../components/CustomInputs";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen () {
    const [user, setUser] = useState(null);
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [list, setList] = useState([]);
    const [editId, setEditId] = useState(null);
   

    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const loadRecords = async () => {
        if (!user) return;
        const snapshot = await getDocs(
            query(
                collection(db, 'records'),
                where('user_id', '==', user.uid)
            )
        );
        const records = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setList(records);
    }

    useEffect(() => {
        if (!user) return;
        loadRecords();
    }, [user]);

    const clearFields = () => {
        setValor('');
        setDescricao('');
        setData('');
        setEditId(null);
    }

    const addOrUpdate = async () => {
        if (!user) {
            Alert.alert('Usuário não autenticado.');
            return;
        }
        if (!valor || !descricao || !data) {
            Alert.alert('Preencha todos os campos.');
            return;
        }
        try {
            if (editId) {
                await updateDoc(doc(db, 'records', editId), {
                    valor: parseFloat(valor),
                    descricao,
                    data
                });
            } else {
                await addDoc(collection(db, 'records'), {
                    valor: parseFloat(valor),
                    descricao,
                    data,
                    user_id: user.uid
                });
            }
            loadRecords();
            clearFields();
        } catch (e) {
            console.log('Erro ao salvar:', e);
            Alert.alert('Erro ao salvar gasto', e.message);
        }
    }

    const startEdit = (item) => {
        setValor(String(item.valor));
        setDescricao(item.descricao);
        setData(item.data);
        setEditId(item.id);
    }

    const remove = async (id) => {
        Alert.alert(
            "Remover gasto",
            "Tem certeza que deseja remover este gasto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        await deleteDoc(doc(db, 'records', id));
                        loadRecords();
                    }
                }
            ]
        );
    }
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
                <Text style={styles.itemValor}>R$ {item.valor}</Text>
                <Text style={styles.itemData}>{item.data}</Text>
            </View>
            <View style={styles.itemButtons}>
                <SecondaryButton text="Editar" action={() => startEdit(item)} />
                <DangerButton text="Excluir" action={() => remove(item.id)} />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Controle de Gastos</Text>                    
                        <SecondaryButton
                            text="Minha Conta"
                            action={() => navigation.navigate('MinhaConta')}
                        />   
                </View>
                <Text style={styles.label}>Valor</Text>
                <CustomTextInput
                    placeholder="Ex: 100.00"
                    value={valor}
                    setValue={setValor}
                    keyboardType="numeric"
                />
                <Text style={styles.label}>Descrição</Text>
                <CustomTextInput
                    placeholder="Ex: Supermercado"
                    value={descricao}
                    setValue={setDescricao}
                />                
                <PrimaryButton
                    text={editId ? "Salvar Alterações" : "Adicionar Gasto"}
                    action={addOrUpdate}
                />
                {editId && (
                    <SecondaryButton text="Cancelar Edição" action={clearFields} />
                )}
                <Text style={styles.title}>Controle de Gastos</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>                    
                    <PrimaryButton
                        text="Meus Gastos"
                        action={() => navigation.navigate('Gastos')}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    subtitle: {
        fontSize: 20,
        marginTop: 30,
        marginBottom: 10,
        color: '#636e72',
        fontWeight: 'bold'
    },
    label: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 10,
        marginBottom: 2,
        marginLeft: 2
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2
    },
    itemDescricao: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    itemValor: {
        fontSize: 16,
        color: '#636e72'
    },
    itemData: {
        fontSize: 14,
        color: '#b2bec3'
    },
    itemButtons: {
        marginLeft: 10,
        justifyContent: 'space-between',
        gap: 8
    },
    emptyText: {
        textAlign: 'center',
        color: '#b2bec3',
        marginTop: 30
    }
});