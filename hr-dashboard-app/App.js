import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// IP address of your computer running the Node.js API server
const API_URL = 'http://192.168.1.18:5000/api/data';

export default function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');

  // Fetch data from API when app starts
  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setRawData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to connect to API server');
        setLoading(false);
      });
  }, []);

  // Extract unique filter options
  const departments = ['All', ...new Set(rawData.map(item => item.Department))].filter(Boolean);
  const genders = ['All', ...new Set(rawData.map(item => item.Gender))].filter(Boolean);

  // Dynamically calculate KPIs and charts based on filters
  const dashboardData = useMemo(() => {
    if (rawData.length === 0) return null;

    // 1. Filter the data
    const filteredData = rawData.filter(item => {
      const matchDept = selectedDept === 'All' || item.Department === selectedDept;
      const matchGender = selectedGender === 'All' || item.Gender === selectedGender;
      return matchDept && matchGender;
    });

    // 2. Calculate KPIs
    const total = filteredData.length;
    const attritionCount = filteredData.filter(item => item.Attrition === 'Yes').length;
    const attritionRate = total > 0 ? ((attritionCount / total) * 100).toFixed(1) : '0.0';

    // 3. Calculate Experience Chart (Attrition Only)
    const expLabels = ['0-2', '3-5', '6-10', '11-20', '20+'];
    const expCounts = [0, 0, 0, 0, 0];
    
    filteredData.forEach(item => {
      if (item.Attrition === 'Yes') {
        const idx = expLabels.indexOf(item.Experience_Group);
        if (idx !== -1) expCounts[idx]++;
      }
    });

    // 4. Calculate Satisfaction Pie (Attrition Only)
    const satCounts = [0, 0, 0, 0];
    filteredData.forEach(item => {
      if (item.Attrition === 'Yes') {
        const sat = parseInt(item.Job_Satisfaction, 10);
        if (sat >= 1 && sat <= 4) {
          satCounts[sat - 1]++;
        }
      }
    });

    return {
      kpis: { total, attritionCount, attritionRate },
      charts: {
        experience: { labels: expLabels, data: expCounts },
        satisfaction: {
          labels: ['Low (1)', 'Med (2)', 'High (3)', 'Very High (4)'],
          data: satCounts
        }
      }
    };
  }, [rawData, selectedDept, selectedGender]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Fetching data from API...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.errorSubText}>Make sure your API server is running on port 5000</Text>
      </View>
    );
  }

  const { kpis, charts } = dashboardData;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const experienceData = {
    labels: charts.experience.labels,
    datasets: [
      {
        data: charts.experience.data,
      },
    ],
  };

  const satisfactionData = charts.satisfaction.labels.map((label, index) => ({
    name: label,
    population: charts.satisfaction.data[index],
    color: ['#ff4d4d', '#ff9933', '#33cc33', '#009933'][index],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  // Reusable Filter Button Component
  const FilterButton = ({ label, selected, onPress }) => (
    <TouchableOpacity 
      style={[styles.filterButton, selected && styles.filterButtonActive]} 
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, selected && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>👥 HR Attrition Dashboard</Text>
      
      {/* FILTER SECTION */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Department Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {departments.map(dept => (
            <FilterButton 
              key={dept} 
              label={dept} 
              selected={selectedDept === dept} 
              onPress={() => setSelectedDept(dept)} 
            />
          ))}
        </ScrollView>
        
        <Text style={styles.filterTitle}>Gender Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {genders.map(gender => (
            <FilterButton 
              key={gender} 
              label={gender} 
              selected={selectedGender === gender} 
              onPress={() => setSelectedGender(gender)} 
            />
          ))}
        </ScrollView>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Employees</Text>
          <Text style={styles.cardValue}>{kpis.total}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attrition Rate</Text>
          <Text style={styles.cardValue}>{kpis.attritionRate}%</Text>
        </View>
      </View>
      
      <View style={styles.kpiContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Attrition</Text>
          <Text style={styles.cardValue}>{kpis.attritionCount}</Text>
        </View>
      </View>

      {/* Experience Level Chart */}
      <Text style={styles.chartTitle}>📉 Attrition by Experience (Years)</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={experienceData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(239, 85, 59, ${opacity})`,
          }}
          verticalLabelRotation={0}
          fromZero
          showValuesOnTopOfBars
        />
      </View>

      {/* Satisfaction Pie Chart */}
      <Text style={styles.chartTitle}>🧩 Attrition by Job Satisfaction</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={satisfactionData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

      <StatusBar style="auto" />
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#8e8e93',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  errorSubText: {
    marginTop: 10,
    color: '#8e8e93',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    paddingTop: 60,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1c1c1e',
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3a3a3c',
    marginBottom: 8,
    marginTop: 4,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  filterButton: {
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  filterButtonActive: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  filterButtonText: {
    color: '#8e8e93',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 5,
    color: '#1c1c1e',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  }
});
