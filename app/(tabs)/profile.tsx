import * as React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Edit, LogOut, ChevronRight, Award, Briefcase, BookOpen, Bell, Share2, Download } from "lucide-react-native";
import Colors from "../../constants/colors";
import { useState } from "react";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=2787&auto=format&fit=crop" }} 
          style={styles.profileImage} 
        />
        <TouchableOpacity style={styles.editProfileButton}>
          <Edit size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.profileName}>Thabo Mbeki</Text>
        <Text style={styles.profileBio}>Computer Science Student at University of Cape Town</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "profile" && styles.activeTab]} 
          onPress={() => setActiveTab("profile")}
        >
          <Text style={[styles.tabText, activeTab === "profile" && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "credentials" && styles.activeTab]} 
          onPress={() => setActiveTab("credentials")}
        >
          <Text style={[styles.tabText, activeTab === "credentials" && styles.activeTabText]}>Credentials</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === "profile" ? (
          // Profile Tab Content
          <>
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Qualifications</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Certificates</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Skills</Text>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              
              <View style={styles.educationItem}>
                <View style={styles.educationIcon}>
                  <BookOpen size={20} color="#FFFFFF" />
                </View>
                <View style={styles.educationContent}>
                  <Text style={styles.educationDegree}>BSc Computer Science</Text>
                  <Text style={styles.educationSchool}>University of Cape Town</Text>
                  <Text style={styles.educationPeriod}>2020 - Present</Text>
                </View>
              </View>
              
              <View style={styles.educationItem}>
                <View style={styles.educationIcon}>
                  <BookOpen size={20} color="#FFFFFF" />
                </View>
                <View style={styles.educationContent}>
                  <Text style={styles.educationDegree}>National Senior Certificate</Text>
                  <Text style={styles.educationSchool}>Pretoria Boys High School</Text>
                  <Text style={styles.educationPeriod}>2016 - 2019</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              
              <View style={styles.workItem}>
                <View style={styles.workIcon}>
                  <Briefcase size={20} color="#FFFFFF" />
                </View>
                <View style={styles.workContent}>
                  <Text style={styles.workPosition}>IT Support Intern</Text>
                  <Text style={styles.workCompany}>Vodacom</Text>
                  <Text style={styles.workPeriod}>June 2022 - December 2022</Text>
                </View>
              </View>
              
              <View style={styles.workItem}>
                <View style={styles.workIcon}>
                  <Briefcase size={20} color="#FFFFFF" />
                </View>
                <View style={styles.workContent}>
                  <Text style={styles.workPosition}>Student Assistant</Text>
                  <Text style={styles.workCompany}>University of Cape Town</Text>
                  <Text style={styles.workPeriod}>February 2021 - November 2021</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setActiveTab('credentials')}
              >
                <View style={styles.menuItemLeft}>
                  <Award size={20} color={Colors.text} />
                  <Text style={styles.menuItemText}>Credentials & Certificates</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Bell size={20} color={Colors.text} />
                  <Text style={styles.menuItemText}>Notifications</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Settings size={20} color={Colors.text} />
                  <Text style={styles.menuItemText}>Settings</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.logoutButton}>
                <LogOut size={20} color={Colors.error} />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Credentials Tab Content
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Qualifications</Text>
              
              <TouchableOpacity style={styles.credentialCard}>
                <View style={styles.credentialHeader}>
                  <Award size={24} color={Colors.primary} />
                  <View style={styles.credentialActions}>
                    <TouchableOpacity style={styles.iconButton}>
                      <Share2 size={20} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <Download size={20} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.credentialTitle}>Bachelor of Science in Computer Science</Text>
                <Text style={styles.credentialIssuer}>University of Cape Town</Text>
                <Text style={styles.credentialDate}>Issued: June 2023</Text>
                
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.credentialCard}>
                <View style={styles.credentialHeader}>
                  <Award size={24} color={Colors.primary} />
                  <View style={styles.credentialActions}>
                    <TouchableOpacity style={styles.iconButton}>
                      <Share2 size={20} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <Download size={20} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.credentialTitle}>National Senior Certificate</Text>
                <Text style={styles.credentialIssuer}>Department of Basic Education</Text>
                <Text style={styles.credentialDate}>Issued: December 2019</Text>
                
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certificates & Badges</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {[
                  { title: "Python Programming", issuer: "University of Johannesburg", date: "March 2023", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2942&auto=format&fit=crop" },
                  { title: "Web Development", issuer: "Wits University", date: "August 2022", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2564&auto=format&fit=crop" },
                  { title: "Project Management", issuer: "UNISA", date: "January 2023", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop" }
                ].map((certificate, index) => (
                  <TouchableOpacity key={index} style={styles.certificateCard}>
                    <Image source={{ uri: certificate.image }} style={styles.certificateImage} />
                    <View style={styles.certificateContent}>
                      <Text style={styles.certificateTitle}>{certificate.title}</Text>
                      <Text style={styles.certificateIssuer}>{certificate.issuer}</Text>
                      <Text style={styles.certificateDate}>{certificate.date}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills & Competencies</Text>
              
              <View style={styles.skillsContainer}>
                {[
                  { name: "Programming", level: "Advanced", verified: true },
                  { name: "Data Analysis", level: "Intermediate", verified: true },
                  { name: "Web Development", level: "Advanced", verified: true },
                  { name: "Project Management", level: "Beginner", verified: false },
                  { name: "Communication", level: "Intermediate", verified: true }
                ].map((skill, index) => (
                  <View key={index} style={styles.skillItem}>
                    <View>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <Text style={styles.skillLevel}>{skill.level}</Text>
                    </View>
                    {skill.verified && (
                      <View style={styles.skillVerifiedBadge}>
                        <Text style={styles.skillVerifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Records</Text>
              
              <TouchableOpacity style={styles.recordItem}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>Academic Transcript</Text>
                  <Text style={styles.recordDescription}>University of Cape Town, 2020-2023</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.recordItem}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>Course Completion Records</Text>
                  <Text style={styles.recordDescription}>All completed courses and modules</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.recordItem}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>Matric Certificate</Text>
                  <Text style={styles.recordDescription}>National Senior Certificate, 2019</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <View style={styles.addCredentialContainer}>
                <Text style={styles.addCredentialTitle}>Add New Credential</Text>
                <Text style={styles.addCredentialDescription}>Upload certificates, badges, or request verification</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>Upload Credential</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  editProfileButton: {
    position: "absolute",
    top: 84,
    right: "50%",
    marginRight: -58,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: Colors.border,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  educationItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  educationContent: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  educationSchool: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  educationPeriod: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  workItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  workIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workContent: {
    flex: 1,
  },
  workPosition: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  workCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  workPeriod: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    marginLeft: 12,
  },
  // Credentials styles
  credentialCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  credentialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  credentialActions: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  credentialTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  credentialIssuer: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  credentialDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: Colors.success + "20", // 20% opacity
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
  },
  horizontalScroll: {
    paddingBottom: 8,
  },
  certificateCard: {
    width: 220,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  certificateImage: {
    width: "100%",
    height: 120,
  },
  certificateContent: {
    padding: 12,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  certificateIssuer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  certificateDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  skillsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  skillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  skillName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 2,
  },
  skillLevel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  skillVerifiedBadge: {
    backgroundColor: Colors.success + "20", // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillVerifiedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addCredentialContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addCredentialTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  addCredentialDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});