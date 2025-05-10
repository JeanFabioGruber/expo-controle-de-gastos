import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, SectionList, ActivityIndicator } from "react-native";
import { db } from '../firebase';
import { SecondaryButton, DangerButton, PrimaryButton } from "../components/Buttons";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { useNavigation } from '@react-navigation/native';

export default function GastosScreen() {
    const [user, setUser] = useState(auth.currentUser);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0); // Novo estado para o total

    const navigation = useNavigation();

    const loadexpenses = async () => {
        if (!user) return;
        setLoading(true);
        const snapshot = await getDocs(
            query(
                collection(db, 'expenses'),
                where('user_id', '==', user.uid)
            )
        );
        const expenses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));       

        // Calcular o total dos gastos
        const totalValue = expenses.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
        setTotal(totalValue);

        const grouped = {};
        expenses.forEach(item => {
            const date = item.data;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(item);
        });       
        const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        const sectionsData = sortedDates.map(date => ({
            title: date,
            data: grouped[date].sort((a, b) => b.valor - a.valor)
        }));
        setSections(sectionsData);
        setLoading(false);
    };

    useEffect(() => {
        loadexpenses();
    }, []);

    const remove = async (id) => {
        await deleteDoc(doc(db, 'expenses', id));
        loadexpenses();
    };
    const edit = (item) => {
        navigation.navigate('Home', { editItem: item });
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemDescricao}>{item.descricao}</Text>
                <Text style={styles.itemValor}>R$ {item.valor}</Text>
            </View>
            <View style={styles.itemButtons}>
                <PrimaryButton text="Editar" action={() => edit(item)} />
                <DangerButton text="Excluir" action={() => remove(item.id)} />
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
            <View style={styles.container}>
                <Text style={styles.title}>Meus Gastos</Text>
                <Text style={styles.totalText}>Total: R$ {total.toFixed(2)}</Text>
                <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum gasto cadastrado.</Text>}
                />
                <SecondaryButton text="Voltar" action={() => navigation.goBack()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1abc9c',
        textAlign: 'center',
        marginBottom: 10,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0984e3',
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: '#dff9fb',
        color: '#636e72',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginTop: 15,
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