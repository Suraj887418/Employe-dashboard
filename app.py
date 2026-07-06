import streamlit as st
import pandas as pd
import plotly.express as px
import os

# Set page config for mobile-friendly layout
st.set_page_config(page_title="HR Attrition Dashboard", page_icon="👥", layout="wide")

# Custom CSS for better mobile appearance
st.markdown("""
<style>
    .reportview-container .main .block-container{
        max-width: 1000px;
        padding-top: 2rem;
        padding-right: 1rem;
        padding-left: 1rem;
        padding-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 15px;
        text-align: center;
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("👥 Employee Attrition Dashboard")
st.markdown("Interactive HR Analytics by **Your Name** (Replace with your name!)")

# Load Data Function
@st.cache_data
def load_data():
    file_path = os.path.join(os.path.dirname(__file__), 'cleaned_hr_data.csv')
    try:
        df = pd.read_csv(file_path)
        return df
    except FileNotFoundError:
        st.error("⚠️ Data file not found. Please ensure 'cleaned_hr_data.csv' is in the same folder.")
        return pd.DataFrame()

df = load_data()

if not df.empty:
    # --- SIDEBAR FILTERS ---
    st.sidebar.header("🔍 Filters")
    
    # Department Filter
    departments = ["All"] + list(df['Department'].unique())
    selected_dept = st.sidebar.selectbox("Select Department", departments)
    
    # Gender Filter
    genders = ["All"] + list(df['Gender'].unique())
    selected_gender = st.sidebar.selectbox("Select Gender", genders)
    
    # Apply Filters
    filtered_df = df.copy()
    if selected_dept != "All":
        filtered_df = filtered_df[filtered_df['Department'] == selected_dept]
    if selected_gender != "All":
        filtered_df = filtered_df[filtered_df['Gender'] == selected_gender]
        
    # --- KPIs ---
    st.markdown("### 📊 Key Metrics")
    col1, col2, col3 = st.columns(3)
    
    total_employees = len(filtered_df)
    attrition_count = len(filtered_df[filtered_df['Attrition'] == 'Yes'])
    attrition_rate = (attrition_count / total_employees * 100) if total_employees > 0 else 0
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h4>Total Employees</h4>
            <h2>{total_employees}</h2>
        </div>
        """, unsafe_allow_html=True)
        
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h4>Attrition Count</h4>
            <h2>{attrition_count}</h2>
        </div>
        """, unsafe_allow_html=True)
        
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h4>Attrition Rate</h4>
            <h2>{attrition_rate:.1f}%</h2>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("---")
    
    # --- CHARTS ---
    # To make charts stack nicely on mobile, we'll just put them one under another
    
    st.markdown("### 📈 Attrition by Experience Level")
    # Group by Years at Company
    exp_bins = [0, 2, 5, 10, 20, 50]
    exp_labels = ['0-2 Years', '3-5 Years', '6-10 Years', '11-20 Years', '20+ Years']
    filtered_df['Experience_Group'] = pd.cut(filtered_df['Years_At_Company'], bins=exp_bins, labels=exp_labels, right=False)
    
    exp_attrition = filtered_df.groupby(['Experience_Group', 'Attrition'], observed=False).size().reset_index(name='Count')
    
    fig_bar = px.bar(exp_attrition, x='Experience_Group', y='Count', color='Attrition', 
                     barmode='group',
                     color_discrete_map={'Yes': '#ef553b', 'No': '#00cc96'})
    st.plotly_chart(fig_bar, use_container_width=True)
    
    st.markdown("---")
    
    st.markdown("### 🔥 Heatmap: Job Satisfaction vs Attrition")
    # Create pivot for heatmap
    heatmap_data = filtered_df.groupby(['Department', 'Job_Satisfaction'], observed=False).apply(
        lambda x: (x['Attrition'] == 'Yes').sum()
    ).reset_index(name='Attrition Count')
    
    fig_heat = px.density_heatmap(heatmap_data, x="Job_Satisfaction", y="Department", z="Attrition Count",
                                  color_continuous_scale="Reds",
                                  labels={'Job_Satisfaction': 'Job Satisfaction (1-Low, 4-High)'})
    st.plotly_chart(fig_heat, use_container_width=True)

    st.markdown("---")
    st.caption("Dashboard built with Streamlit & Plotly")
