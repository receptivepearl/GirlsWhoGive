'use client'
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import { serializeOrganization } from "@/lib/organizationUtils";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {
    const router = useRouter()
    const { user } = useUser()
    const { getToken } = useAuth()

    const [userData, setUserData] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [organizationProfile, setOrganizationProfile] = useState(null)
    const [organizations, setOrganizations] = useState([])
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(false)
    const [userDataLoaded, setUserDataLoaded] = useState(false)

    const fetchUserData = async () => {
        if (!user) {
            setUserDataLoaded(true)
            return null
        }

        setUserDataLoaded(false)
        
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/user/data', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                const organization = serializeOrganization(data.organization)
                setUserData(data.user)
                setUserRole(organization ? 'organization' : (data.user.role || 'donor'))
                setOrganizationProfile(organization)
                return data
            }

            setUserData(null)
            setUserRole(null)
            setOrganizationProfile(null)
            return null
        } catch (error) {
            console.error('Error fetching user data:', error)
            setUserData(null)
            setUserRole(null)
            setOrganizationProfile(null)
            return null
        } finally {
            setUserDataLoaded(true)
        }
    }

    const createUser = async (role = 'donor') => {
        if (!user) return null;
        
        try {
            const token = await getToken()
            const payload = {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                role: role
            }

            const { data } = await axios.post('/api/user/create', payload, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setUserData(data.user)
                setUserRole(data.user.role || role)
                return data.user
            }
        } catch (error) {
            console.error('Error creating user:', error)
            toast.error('Error setting up your account')
            throw error
        }
    }

    const fetchDonations = async () => {
        if (!user || userRole !== 'donor') return;
        
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/donations/user', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setDonations(data.donations)
            }
        } catch (error) {
            console.error('Error fetching donations:', error)
        }
    }

    const createDonation = async (donationData) => {
        try {
            const token = await getToken()
            
            const isFormData = donationData instanceof FormData;
            
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
                }
            }
            
            const { data } = await axios.post('/api/donations/create', donationData, config)
            if (data.success) {
                toast.success('Donation commitment created successfully!')
                fetchDonations()
                return data.donation
            }
        } catch (error) {
            console.error('Error creating donation:', error)
            const errorMessage = error.response?.data?.message || 'Error creating donation commitment'
            toast.error(errorMessage)
            throw error
        }
    }

    const createOrganization = async (organizationData) => {
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/organizations/create', organizationData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setUserRole('organization')
                setOrganizationProfile(serializeOrganization(data.organization))
                return { ...serializeOrganization(data.organization), pendingApproval: data.pendingApproval }
            }
        } catch (error) {
            console.error('Error creating organization:', error)
            toast.error(error.response?.data?.message || 'Error creating organization')
            throw error
        }
    }

    const cancelDonation = async (donationId) => {
        try {
            const token = await getToken()
            const { data } = await axios.put('/api/donations/cancel', { donationId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success('Donation commitment cancelled successfully')
                fetchDonations()
                return data.donation
            }
        } catch (error) {
            console.error('Error cancelling donation:', error)
            toast.error(error.response?.data?.message || 'Error cancelling donation commitment')
            throw error
        }
    }

    useEffect(() => {
        if (user) {
            fetchUserData()
        } else {
            setUserData(null)
            setUserRole(null)
            setOrganizationProfile(null)
            setDonations([])
            setOrganizations([])
            setUserDataLoaded(true)
        }
    }, [user])

    useEffect(() => {
        if (userRole === 'donor') {
            fetchDonations()
        }
    }, [userRole])

    const value = {
        user, getToken,
        router,
        userData, userRole, organizationProfile, userDataLoaded,
        organizations, donations,
        loading, setLoading,
        fetchUserData, createUser,
        fetchDonations, createDonation,
        createOrganization, cancelDonation
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
